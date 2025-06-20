'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaMapMarkerAlt, FaClock, FaCheckCircle, FaStar } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import { differenceInCalendarDays, isWithinInterval, parseISO } from 'date-fns';
import { useAuthStore } from '@/app/zustand/store';

const weekMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

// 1시간 단위 시간 슬롯 생성 함수
function getHourSlots(start, end) {
  const slots = [];
  let [sh, sm] = start.split(':').map(Number);
  let [eh, em] = end.split(':').map(Number);

  let current = new Date(0, 0, 0, sh, sm);
  const endTime = new Date(0, 0, 0, eh, em);

  while (current < endTime) {
    const next = new Date(current.getTime() + 60 * 60 * 1000);
    if (next > endTime) break;
    const pad = n => n.toString().padStart(2, '0');
    slots.push({
      time: `${pad(current.getHours())}:00`,
      endTime: `${pad(next.getHours())}:00`
    });
    current = next;
  }
  return slots;
}

const ReservationContent = () => {
  const searchParams = useSearchParams();
  const initialCenterId = searchParams.get('center_id');
  const initialTrainerId = searchParams.get('trainer_id');

  // 상태
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMyProductSelected, setIsMyProductSelected] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // 클래스 관련
  const [classInfo, setClassInfo] = useState(null); // 선택 상품의 클래스 정보
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedClass_idx, setSelectedClass_idx] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // 예약 인원 체크 상태
  const [timeSlotCounts, setTimeSlotCounts] = useState({}); // 시간별 예약 인원
  const [dateBookedCount, setDateBookedCount] = useState(0); // 날짜별 예약 인원

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [disabledDates, setDisabledDates] = useState([]);
  const [productTrainerInfo, setProductTrainerInfo] = useState(null);


  const [dateBookedCounts, setDateBookedCounts] = useState({});

  const [paymentMethod, setPaymentMethod] = useState('direct');
  const [showKakaoQR, setShowKakaoQR] = useState(false);
  const [kakaoQRUrl, setKakaoQRUrl] = useState('');
  const [kakaoTid, setKakaoTid] = useState('');
  const [waitingKakao, setWaitingKakao] = useState(false);

  const [myProducts, setMyProducts] = useState([]);
  const [myProductLoading, setMyProductLoading] = useState(true);

  const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
      checkAuthAndAlert(router, null, { noGuest: true });
  }, [checkAuthAndAlert, router]);

  useEffect(() => {
    if(!selectedProduct){
      return;
    }
    if(availableTimes && availableTimes.length > 0 && !availableTimes[0].class_idx && selectedDate){
        axios.post(`${apiUrl}/reservation/booked_count`,{
          date : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
          product_idx : selectedProduct.product_idx,
          times : availableTimes.map((t)=>({start_time :t.time ,end_time : t.endTime}))
        })
            .then(({data}) => {
              console.log(data);
              console.log(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`);
              setTimeSlotCounts((prev)=>({
                ...prev,
                [selectedProduct.product_idx]:data.counts || {}
              }));
            });

    }
  }, [availableTimes]);

  // 센터 정보 불러오기
  useEffect(() => {
    axios.post(`${apiUrl}/reservation/center_info/${initialCenterId}`)
      .then(res => {
        setCenters(res.data.list || []);
        if (res.data.list && res.data.list.length > 0) {
          setSelectedCenter(res.data.list[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!user_id || !initialCenterId) return;
    setMyProductLoading(true);
    axios.post(`${apiUrl}/reservation/myproduct_list`, {
        user_id : user_id,
        center_id : initialCenterId
      })
      .then(res => setMyProducts(res.data.list || []))
      .catch(() => setMyProducts([]))
      .finally(() => setMyProductLoading(false));
  }, [user_id, initialCenterId]);

  // 센터/트레이너 자동 선택
  useEffect(() => {
    if (!centers.length) return;
    if (initialCenterId) {
      const center = centers.find(c => String(c.center_id) === String(initialCenterId));
      if (center) setSelectedCenter(center);
    }
    if (initialTrainerId && !selectedTrainer && !selectedProduct?.duration) {
      const center = centers.find(c => String(c.center_id) === String(initialCenterId));
      if (!center) return;
      axios.post(`${apiUrl}/reservation/trainer_info/${center.center_idx}`)
        .then(res => {
          const trainer = res.data.list?.find(t => String(t.trainer_id) === String(initialTrainerId));
          if (trainer) setSelectedTrainer(trainer);
        });
    }
  }, [centers, initialCenterId, initialTrainerId, selectedTrainer, selectedProduct]);

  // 센터 선택 시 상품/트레이너 불러오기
  useEffect(() => {
    if (!selectedCenter) return;
    axios.post(`${apiUrl}/reservation/center_product/${selectedCenter.center_id}`)
      .then(res => setProducts(res.data.list || []));
    axios.post(`${apiUrl}/reservation/trainer_info/${selectedCenter.center_idx}`)
      .then(res => setTrainers(res.data.list || []));
  }, [selectedCenter]);

  useEffect(() => {
    if (!selectedProduct || classInfo) return;
    // 한 달치(혹은 원하는 범위) 예약 인원 카운트
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    axios.post(`${apiUrl}/reservation/booked_count_date_range`, {
      product_idx: selectedProduct.product_idx,
      start_date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
      end_date: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
    }).then(res => {
      setDateBookedCounts(res.data.counts || {});
    });
  }, [selectedProduct, classInfo]);
  

  // 상품 클릭 시 클래스 정보 불러오기
  const handleProductClick = (product, isMyProduct = false) => {
    setSelectedProduct(product);
    setIsMyProductSelected(isMyProduct);
    setSelectedTrainer(null);
    setClassInfo(null);
    setAvailableTimes([]);
    setSelectedTime(null);
    setSelectedDate(new Date());
    setProductTrainerInfo(null);
    setTimeSlotCounts({});
    setDateBookedCount(0);
  
    // 트레이너 정보 등은 기존과 동일하게 처리
    if (product.trainer_id) {
      axios.post(`${apiUrl}/reservation/class_info`, {
        center_id: product.center_id,
        trainer_id: product.trainer_id,
        product_idx: product.product_idx
      }).then(res => {
        const cls = (res.data.list || []).filter(c => !c.delete);
        setClassInfo(cls || null);
        const cls_trainer_id = [...new Set(res.data.list.filter(c=> !c.delete)?.map(c=>c.trainer_id))];
        const trainer = cls_trainer_id.map(id=>{
          return trainers.find(t => t.trainer_id === id);
        }) ;
        setProductTrainerInfo(trainer || null);
      });
    } else {
      setClassInfo(null);
      if(!product.duration) {
        setProductTrainerInfo(trainers);
      }
    }
  };

  useEffect(() => {
    if(selectedClass_idx){
      setSelectedClass(classInfo.find(c=>c.class_idx === selectedClass_idx));
    }
  }, [selectedClass_idx]);

  useEffect(() => {
    if(productTrainerInfo) {
      axios.post(`${apiUrl}/reservation/class_info`, {
        center_id: selectedProduct.center_id,
        trainer_id: selectedProduct.trainer_id,
        product_idx: selectedProduct.product_idx
      }).then(res => {
        const cls = (res.data.list || []).filter(c => !c.delete).filter(c => c.trainer_id === selectedTrainer.trainer_id);
        setClassInfo(cls || null);
        if(cls.length===0){
          const arr = selectedCenter.operation_hours.split('-') || selectedCenter.operation_hours.split('~');
          const slots = getHourSlots(arr[0],arr[1]);
          setAvailableTimes(slots);
        }
      })
    }
  }, [selectedTrainer,selectedDate])

  // 날짜 변경 시 시간 슬롯 생성 및 예약 인원 체크
  useEffect(() => {
    if (!selectedProduct) return;
    // 시간 있는 상품(클래스)
    if (classInfo && classInfo.length>0) {
      const day = selectedDate.getDay();
      const filteredclassInfo = classInfo.filter(cls=>{
        if(!cls.start_time || !cls.end_time) return false;
        const weekArr = cls.week.split(',').map(w => weekMap[w.trim()]);
        //console.log(weekArr);
        if (!weekArr.includes(day)) {
          setAvailableTimes([]);
          setTimeSlotCounts({});
          return false;
        }
        return weekArr.includes(day);
      });
      console.log('filteredclassInfo',filteredclassInfo);
      //const slots = filteredclassInfo.map(info=>getHourSlots(info.start_time, info.end_time,info.class_idx)).flat();
      const slots = filteredclassInfo.map(info => ({
        time: info.start_time,
        endTime: info.end_time,
        class_idx: info.class_idx
      }))
      console.log(filteredclassInfo);
      setAvailableTimes(slots);
      // 시간별 예약 인원 조회
      filteredclassInfo.forEach(c=>{
        axios.post(`${apiUrl}/reservation/booked_count`, {
          class_idx: c.class_idx,
          date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
          times: slots.map(slot => ({ start_time: slot.time, end_time: slot.endTime }))
        }).then(res => {
          setTimeSlotCounts((prev)=>({
            ...prev,
            [c.class_idx]:res.data.counts || {}
          }));
        })
      })
    } else {
      // 시간 없는 상품: 날짜별 예약 인원 조회
      axios.post(`${apiUrl}/reservation/booked_count_date`, {
        product_idx: selectedProduct.product_idx,
        date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      }).then(res => {
        setDateBookedCount(res.data.count || 0);
      });
    }
  }, [selectedDate, classInfo, selectedProduct]);

  // 캘린더에서 week에 포함된 요일만 선택 가능(시간 없는 상품은 모두 가능)
  const tileDisabled = useCallback(({ date, view }) => {
    if (view !== 'month') return false;
    if (classInfo && classInfo.length>0) {
      const boolean = classInfo.every(c=> {
        const weekArr = c.week.split(',').map(w => weekMap[w.trim()]);
        return !weekArr.includes(date.getDay());
      })
      if (boolean) return true;
    }
    // 시간 없는 상품: 날짜별 예약 인원이 max_people 이상이면 비활성화
    if (!classInfo && selectedProduct) {
      const dateStr = date.toISOString().slice(0, 10);
      const booked = dateBookedCounts[dateStr] || 0;
      if (selectedProduct.max_people > 0 && booked >= selectedProduct.max_people) {
        return true;
      }
    }
    return false;
  }, [classInfo, selectedProduct, dateBookedCount]);

  useEffect(() => {
    if (!selectedProduct || classInfo) return;
    const dateStr = selectedDate.toISOString().slice(0, 10);
    setDateBookedCount(dateBookedCounts[dateStr] || 0);
  }, [selectedDate, selectedProduct, classInfo, dateBookedCounts]);

  // 휴무일 정보 불러오기 (기존 유지)
  useEffect(() => {
    if (!selectedCenter) return;
    axios.post(`${apiUrl}/reservation/schedule_info`, {
      center_id: selectedCenter?.center_id,
      trainer_id: selectedTrainer?.trainer_id
    }).then(res => {
      const list = res.data.list || [];
      const disabled = [];
      list.forEach(item => {
        if (item.start_date === item.end_date) {
          disabled.push(item.start_date);
        } else {
          disabled.push({ start: item.start_date, end: item.end_date });
        }
      });
      setDisabledDates(disabled);
    });
  }, [selectedCenter, selectedTrainer]);

  // 휴무일 + 클래스 요일 비활성화 동시 적용
  const isDateDisabled = useCallback(({ date, view }) => {
    if (tileDisabled({ date, view })) return true;
    // 휴무일 체크
    return disabledDates.some(disabled => {
      if (typeof disabled === 'string') {
        return differenceInCalendarDays(date, parseISO(disabled)) === 0;
      }
      if (typeof disabled === 'object' && disabled.start && disabled.end) {
        return isWithinInterval(date, {
          start: parseISO(disabled.start),
          end: parseISO(disabled.end)
        });
      }
      return false;
    });
  }, [tileDisabled, disabledDates]);

  // 예약 생성
  const handleSubmitReservation = () => {
    setIsSubmitting(true);
  
    // 내상품 예약
    if (isMyProductSelected) {
      const param = {
        user_id: user_id,
        buy_idx: selectedProduct.buy_idx, // 내상품 PK
        product_idx: selectedProduct.product_idx,
        date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        start_time: selectedTime?.time || null,
        end_time: selectedTime?.endTime || null,
        trainer_id: selectedTrainer?.trainer_id || null,
        class_idx: selectedClass?.class_idx,
        center_id: selectedCenter.center_id,
      };
      axios.post(`${apiUrl}/booking`, param)
        .then(res => {
          console.log('param',param);
          console.log(res.data);
          setIsSubmitting(false);
          if (res.data.success) {
            setResultMsg('예약이 완료되었습니다!');
            setStep(5);
          } else {
            setResultMsg('예약에 실패했습니다. 인원 초과 또는 오류');
            alert('예약에 실패했습니다. 인원 초과 또는 오류');
          }
        })
        .catch(() => {
          setIsSubmitting(false);
          setResultMsg('예약 중 오류가 발생했습니다.');
          alert('예약 중 오류가 발생했습니다.');
        });
    } else {
      // 전체상품 예약(현장결제)
      const param = {
        user_id: user_id,
        center_id: selectedCenter.center_id,
        product_idx: selectedProduct.product_idx,
        trainer_id: selectedTrainer?.trainer_id || null,
        class_idx: selectedClass?.class_idx,
        date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        start_time: selectedTime?.time || null,
        end_time: selectedTime?.endTime || null
      };
      axios.post(`${apiUrl}/booking`, param)
        .then(res => {
          console.log('param',param);
          setIsSubmitting(false);
          if (res.data.success) {
            setResultMsg('예약이 완료되었습니다!');
            setStep(5);
          } else {
            setResultMsg('예약에 실패했습니다. 인원 초과 또는 오류');
            alert('예약에 실패했습니다. 인원 초과 또는 오류');
          }
        })
        .catch(() => {
          setIsSubmitting(false);
          setResultMsg('예약 중 오류가 발생했습니다.');
          alert('예약 중 오류가 발생했습니다.');
        });
    }
  };
  

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    const discountAmount = selectedProduct.price * (selectedProduct.discount_rate / 100);
    return Math.floor((selectedProduct.price - discountAmount)/100)*100;
  };

  // --- 렌더링 함수들 ---
  const renderCenterSelectionStep = () => {
    const onlyOneCenter = centers.filter(center => center.center_id === initialCenterId);
  
    return (
      <div className="reservation-section">
        <h3>운동 기관 선택</h3>
        <div className="center-list">
          {onlyOneCenter.map(center => (
            <div
              key={center.center_id}
              className={`center-card ${selectedCenter?.center_id === center.center_id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedCenter(center);
                setSelectedProduct(null);
                setSelectedTrainer(null);
                setClassInfo(null);
                setAvailableTimes([]);
                setSelectedTime(null);
                setStep(1);
              }}
            >
              <div className="center-info">
                <img src={`${apiUrl}/profileImg/profile/${center.center_id}`} alt="프로필" style={{width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc', marginBottom:10}} />
                <h4 className='page-title' style={{margin:0}}>{center.center_name}</h4>
                <p className="center-address"><FaMapMarkerAlt /> {center.address}</p>
                <p className="center-rating">
                  <FaStar />
                  <span style={{fontWeight: '600', fontSize: '18px', color:'#000'}}>
                    {center.avg_rating !== null && center.avg_rating !== undefined
                    ? Math.round(center.avg_rating * 10) / 10
                    : '-'}
                  </span>
                  <span style={{color: 'rgb(136, 136, 136)', fontSize:'15px'}}> ({center.rating_count})</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    if (!products.length || !selectedCenter) {
      setFilteredProducts([]);
      return;
    }
  
    const filterProducts = async () => {
      // 레벨 2: 시간 없는 상품(트레이너/일반 모두) 제외
      if (selectedCenter.exercise_level === 2) {
        const filtered = await Promise.all(products.map(async (product) => {
          if (product.trainer_id) {
            // 트레이너 상품: classInfo에서 시간 정보 체크
            try {
              const res = await axios.post(`${apiUrl}/reservation/class_info`, {
                center_id: product.center_id,
                trainer_id: product.trainer_id,
                product_idx: product.product_idx
              });
              const cls = (res.data.list || []).filter(
                c => !c.delete && c.start_time && c.end_time
              );
              if (cls.length > 0) return product;
              return null;
            } catch {
              return null;
            }
          } else {
            // 일반 상품: start_time, end_time 모두 있어야 노출
            if (product.start_time && product.end_time) return product;
            return null;
          }
        }));
        setFilteredProducts(filtered.filter(Boolean));
        return;
      }
  
      // 레벨 4: 트레이너 상품만 시간 없는 상품 제외, 일반 상품은 무조건 노출
      if (selectedCenter.exercise_level === 4) {
        const filtered = await Promise.all(products.map(async (product) => {
          if (!product.trainer_id) {
            // 일반 상품: 시간 정보 없어도 무조건 노출
            return product;
          }
          // 트레이너 상품: classInfo에서 시간 정보 체크
          try {
            const res = await axios.post(`${apiUrl}/reservation/class_info`, {
              center_id: product.center_id,
              trainer_id: product.trainer_id,
              product_idx: product.product_idx
            });
            const cls = (res.data.list || []).filter(
              c => !c.delete && c.start_time && c.end_time
            );
            if (cls.length > 0) return product;
            return null;
          } catch {
            return null;
          }
        }));
        setFilteredProducts(filtered.filter(Boolean));
        return;
      }
  
      // 그 외 레벨: 전체 노출
      setFilteredProducts(products);
    };
  
    filterProducts();
  }, [products, selectedCenter]);

  const renderProductSelectionStep = () => (
    <div className="reservation-section">
      <h3>상품 선택</h3>
  
      {/* 내가 구매한 상품 영역 */}
      <div className="my-product-section" style={{marginBottom: 24}}>
        <h3>내가 구매한 상품</h3>
        {filteredProducts.length > 0 ? (
          <div className="product-list">
            {myProducts
              .filter(prod => prod.count > 0 || prod.rest_period > 0 && prod.status === '결제')
              .map(product => (
                <div
                  key={product.buy_idx}
                  className={`product-card ${ isMyProductSelected && selectedProduct?.buy_idx === product.buy_idx ? 'selected' : ''}`}
                  onClick={() => handleProductClick(product, true)} // 두 번째 인자로 내상품 여부
                >
                  <h4>{product.product_name}</h4>
                  <div className='flex column gap_10'>
                    {product.count == null || product.count == undefined ? "" :  <p style={{fontSize:'1.3rem'}}>남은횟수: {product.count}</p>}
                    {product.rest_period == null || product.rest_period == undefined ? "" :  <p style={{fontSize:'1.3rem'}}>남은기간: {product.rest_period}일</p>}
                    <p style={{fontSize:'1.3rem'}}>구매일: {product.reg_date?.split('T')[0]}</p>
                    <p style={{fontSize:'1.3rem'}}>결제수단: {product.payment_method}</p>
                  </div>
                  {product.trainer_id && (
                    <div>
                      <p className='label font_weight_700'>트레이너 상품</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p style={{color: '#aaa'}}>구매한 상품이 없습니다.</p>
        )}
      </div>
  
      {/* 전체 상품 영역 */}
      <div className="all-product-section">
        <h3>전체 상품</h3>
        <div className="product-list">
          {filteredProducts.map(product => (
            <div
              key={product.product_idx}
              className={`product-card ${!isMyProductSelected && selectedProduct?.product_idx === product.product_idx ? 'selected' : ''}`}
              onClick={() => handleProductClick(product, false)}
            >
              <h4>{product.product_name}</h4>
              <p className="product-price">
                {product.discount_rate > 0 ? (
                  <>
                    <span className="original-price">{product.price.toLocaleString()}원</span>
                    <span className="discount-rate">{product.discount_rate}% 할인</span>
                    <span className="final-price">
                      {(Math.floor((product.price * (1 - product.discount_rate / 100))/100)*100).toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span className="final-price">{(Math.floor(product.price/100)*100).toLocaleString()}원</span>
                )}
              </p>
              {product.max_people > 0 && (
                <p className="product-count">수강 인원: {product.max_people}명</p>
              )}
              {product.trainer_id && (
                <div>
                  <p className='label font_weight_700'>트레이너 상품</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
  
      {/* 트레이너 정보 노출 */}
      {selectedProduct && productTrainerInfo && productTrainerInfo.map(info=>(
        <div key={info.trainer_id} className={`trainer-info-box ${selectedTrainer && selectedTrainer.trainer_id === info.trainer_id ? 'selected' : ''}`} style={{marginTop: '16px', padding: '16px', border: '1px solid #eee', borderRadius: '8px',cursor:'pointer'}}
             onClick={()=>setSelectedTrainer(info)}>
          <div className="flex column align_center justify_con_center gap_20">
            <img src={`${apiUrl}/profileImg/profile/${info.trainer_id}`} alt="프로필" style={{width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc'}} />
            <div className='flex column gap_3'>
              <h4 className='page-title mb_0'>{info.name || info.trainer_id}</h4>
              <p className='label'>{info.career}</p>
              <p className='label flex align_center justify_con_center gap_3'>
                <FaStar color='rgb(255, 193, 7)'/> {info.avg_rating ? info.avg_rating.toFixed(1) : '-'}
                {' '}({info.rating_count || 0}건)
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  

  const renderDateTimeSelectionStep = () => (
    <div className="reservation-section">

      <div className="date-selection">
        {/*{classInfo && (*/}
        {/*  <div className='label mb_10'>*/}
        {/*    <strong>클래스 시간 : </strong> {classInfo.start_time} ~ {classInfo.end_time} ({classInfo.week})*/}
        {/*  </div>*/}
        {/*)}*/}
        {selectedTrainer && (
          <div className='label mb_10'>
            <strong>트레이너 : </strong> {selectedTrainer.name || selectedTrainer.trainer_id}
          </div>
        )}
        <h3>날짜 선택</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          minDate={new Date()}
          className="reservation-calendar"
          tileDisabled={isDateDisabled}
        />
        {/* 시간 없는 상품: 날짜별 예약 인원 마감 안내 */}
        {!classInfo && selectedProduct && selectedProduct.max_people > 0 && dateBookedCount >= selectedProduct.max_people && (
          <div style={{color:'#d00',marginTop:8}}>이 날짜는 예약이 마감되었습니다.</div>
        )}
      </div>
      {/* 시간 있는 상품: 시간별 예약 인원 마감 안내 및 버튼 */}
      {selectedProduct.trainer_id && availableTimes.length > 0 && (
        <div className="time-selection" style={{marginTop: '16px'}}>
          <h3>시간 선택</h3>
          <div className="time-slots">
            {availableTimes.map((slot, idx) => {
              const key = `${slot.time}-${slot.endTime}`;
              const booked = timeSlotCounts[String(slot.class_idx)]?.[key] || 0;
              const isFull = booked >= (selectedProduct?.max_people || 0);
              return (
                <button
                  key={idx}
                  className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                  style={{
                    background: selectedTime === slot ? '#27262a' : isFull ? '#ccc' : '#eee',
                    color: isFull ? '#999' : selectedTime === slot ? '#fff' : '#222',
                    padding: '13px 16px',
                    borderRadius: 4,
                    border: 'none',
                    marginRight: 8,
                    cursor: isFull ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isFull}
                  onClick={() => {
                    !isFull && setSelectedTime(slot);
                    setSelectedClass_idx(slot.class_idx);
                  }}
                >
                  <FaClock /> {slot.time} - {slot.endTime}
                  {isFull && <span style={{color:'#d00',marginLeft:4}}>(마감)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {!selectedProduct.trainer_id && availableTimes.length > 0 && (
          <div className="time-selection" style={{marginTop: '16px'}}>
            <h3>시간 선택</h3>
            <div className="time-slots">
              {availableTimes.map((slot, idx) => {
                const key = `${slot.time}-${slot.endTime}`.trim();
                const booked = timeSlotCounts[selectedProduct.product_idx][key] || 0;
                const isFull = booked >= (selectedProduct?.max_people || 0);
                return (
                    <button
                        key={idx}
                        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                        style={{
                          background: selectedTime === slot ? '#27262a' : isFull ? '#ccc' : '#eee',
                          color: isFull ? '#999' : selectedTime === slot ? '#fff' : '#222',
                          padding: '13px 16px',
                          borderRadius: 4,
                          border: 'none',
                          marginRight: 8,
                          cursor: isFull ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isFull}
                        onClick={() => {
                          !isFull && setSelectedTime(slot);
                          console.log('timeSlotCounts',timeSlotCounts);
                          console.log('availableTimes',availableTimes);
                        }}
                    >
                      <FaClock /> {slot.time} - {slot.endTime}
                      {isFull && <span style={{color:'#d00',marginLeft:4}}>(마감)</span>}
                    </button>
                );
              })}
            </div>
          </div>
      )}
      {/* 시간 없는 상품은 시간 선택 UI 없음 */}
    </div>
  );

  const handleReservationPayment = async () => {
    if (isMyProductSelected) {
      // 내상품은 결제 없이 바로 예약만 처리
      handleSubmitReservation();
      return;
    }
  
    // 전체상품 결제 플로우
    if (paymentMethod === 'direct') {
      handleSubmitReservation();
    } else if(paymentMethod === 'card'){
      setIsSubmitting(true);

      const bookingParam = {
        user_id: user_id,
        center_id: selectedCenter.center_id,
        product_idx: selectedProduct.product_idx,
        trainer_id: selectedTrainer?.trainer_id || null,
        payment_price: calculateFinalPrice(),
        class_idx: selectedClass?.class_idx,
        count: selectedProduct.count > 0 ? selectedProduct.count- 1 : null,
        rest_period: selectedProduct.duration,
        date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        start_time: selectedTime?.time || null,
        end_time: selectedTime?.endTime || null
      };

      const {data} = await axios.post(`${apiUrl}/insert/payment`, bookingParam);
      if(!data.success){
        alert('결제 도중 오류가 발생했습니다.');
      } else {
        setStep(5);
      }
      setIsSubmitting(false);

    } else if (paymentMethod === 'kakao') {
      setIsSubmitting(true);
  
      const bookingParam = {
        user_id: user_id,
        center_id: selectedCenter.center_id,
        product_idx: selectedProduct.product_idx,
        trainer_id: selectedTrainer?.trainer_id || null,
        payment_price: calculateFinalPrice(),
        class_idx: selectedClass?.class_idx,
        count: selectedProduct.count > 0 ? selectedProduct.count- 1 : null,
        rest_period: selectedProduct.duration,
        date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        start_time: selectedTime?.time || null,
        end_time: selectedTime?.endTime || null
      };
      window.localStorage.setItem("booking_param", JSON.stringify(bookingParam));
  
      try {
        const res = await axios.post(`${apiUrl}/kakaopay/ready`, {
          user_id: user_id,
          product_idx: selectedProduct.product_idx,
          item_name: selectedProduct.product_name,
          total_amount: calculateFinalPrice(),
        });
        window.localStorage.setItem("kakao_tid", res.data.tid);
        window.open(res.data.qr_url, '_blank', 'width=500,height=700');
        setKakaoTid(res.data.tid);
        setWaitingKakao(true);
        setIsSubmitting(false);
      } catch (e) {
        setIsSubmitting(false);
        alert('카카오페이 결제 준비 중 오류가 발생했습니다.');
      }
    }
  };
  
  
  
  useEffect(() => {
    let interval;
    if (waitingKakao && kakaoTid) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${apiUrl}/kakaopay/status?tid=${kakaoTid}`);
          if (res.data.status === '성공') {
            setShowKakaoQR(false);
            setWaitingKakao(false);
            setStep(5); // 예약 완료 화면으로 이동만!
          } else if (res.data.status === '실패' || res.data.status === '취소') {
            setShowKakaoQR(false);
            setWaitingKakao(false);
            alert('카카오페이 결제 실패 또는 취소');
          }
        } catch (e) {}
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [waitingKakao, kakaoTid]);
  
  
  useEffect(() => {
    window.goToCompletionStep = () => setStep(5);
    return () => { delete window.goToCompletionStep; };
  }, []);
  

  const renderConfirmationStep = () => (
    <div className="reservation-section">
      <h3 className='page-title'>예약 정보 확인</h3>
      <div className="confirmation-details">
        <div className="detail-item">
          <span className="label">센터 : </span>
          <span className="value label text_left">{selectedCenter.center_name}</span>
        </div>
        <div className="detail-item">
          <span className="label">상품 : </span>
          <span className="value label text_left">{selectedProduct.product_name}</span>
        </div>
        {selectedTrainer && (
          <div className="detail-item">
            <span className="label">트레이너 : </span>
            <span className="value label text_left">{selectedTrainer.name || selectedTrainer.trainer_id}</span>
          </div>
        )}
        {selectedClass && (
          <div className="detail-item">
            <span className="label">클래스 시간 : </span>
            <span className="value label text_left">{selectedClass.start_time} ~ {selectedClass.end_time} ({selectedClass.week})</span>
          </div>
        )}
        <div className="detail-item">
          <span className="label">예약 날짜 : </span>
          <span className="value label text_left">{selectedDate.toLocaleDateString()}</span>
        </div>
        {selectedTime && (
          <div className="detail-item">
            <span className="label">예약 시간 : </span>
            <span className="value label text_left">{selectedTime.time} - {selectedTime.endTime}</span>
          </div>
        )}
        <div className="detail-item price">
          <span className="label">최종 가격 : </span>
          <span className="value text_left final-price label">{calculateFinalPrice().toLocaleString()}원</span>
        </div>
        {/* 내상품 예약일 때만 버튼만 노출 */}
        {isMyProductSelected ? (
          <button
            className="btn label white_color"
            onClick={handleReservationPayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '내상품으로 예약하기'}
          </button>
        ) : (
          <div className="payment-methods">
            <h4 className='page-title'>결제 수단 선택</h4>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="direct"
                  checked={paymentMethod === 'direct'}
                  onChange={() => setPaymentMethod('direct')}
                />
                <span className='label'>현장결제</span>
              </label>
              <label className="payment-option">
                <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                />
                <span className='label'>카드</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="kakao"
                  checked={paymentMethod === 'kakao'}
                  onChange={() => setPaymentMethod('kakao')}
                />
                <span className='label'>카카오페이</span>
              </label>
            </div>
            <button
              className="btn label white_color"
              onClick={handleReservationPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '예약 및 결제하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="reservation-section completion">
      <div className="completion-message">
        <FaCheckCircle className="success-icon" />
        <h2>예약이 완료되었습니다!</h2>
        <p>예약 정보는 마이페이지에서 확인하실 수 있습니다.</p>
        <div className="reservation-summary">
          <h3>예약 정보</h3>
          <div className="detail-item">
            <span className="label">예약번호:</span>
            <span className="value label">{selectedProduct.product_idx}</span>
          </div>
          <div className="detail-item">
            <span className="label">센터:</span>
            <span className="value label">{selectedCenter.center_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">상품:</span>
            <span className="value label">{selectedProduct.product_name}</span>
          </div>
          {selectedClass && (
            <div className="detail-item">
              <span className="label">클래스 시간:</span>
              <span className="value label">{selectedClass.start_time} ~ {selectedClass.end_time} ({selectedClass.week})</span>
            </div>
          )}
          {selectedTrainer && (
            <div className="detail-item">
              <span className="label">트레이너:</span>
              <span className="value label">{selectedTrainer.name || selectedTrainer.trainer_id}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="label">날짜:</span>
            <span className="value label">{selectedDate.toLocaleDateString()}</span>
          </div>
          {selectedTime && (
            <div className="detail-item">
              <span className="label">시간:</span>
              <span className="value label">{selectedTime.time} - {selectedTime.endTime}</span>
            </div>
          )}
        </div>
        <div className="action-buttons">
          <button className="btn label white_color" onClick={() => window.location.href = '/component/membermypage'}>
            예약 내역 확인
          </button>
          <button className="btn label white_color" onClick={() => window.location.href = '/'}>
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const steps = [
      { number: 1, name: '센터 선택' },
      { number: 2, name: '상품' },
      { number: 3, name: '날짜/시간' },
      { number: 4, name: '예약 확인' }
    ];
    return (
      <div className="progress-bar">
        {steps.map((s) => (
          <div
            key={s.number}
            className={`progress-step ${step >= s.number ? 'active' : ''} ${step === s.number ? 'current' : ''}`}
          >
            <div className="step-number">{s.number}</div>
            <div className="step-name">{s.name}</div>
          </div>
        ))}
      </div>
    );
  };

  const canGoNext = () => {
    if (step === 1) return !!selectedCenter;
    if (step === 2) return !!selectedProduct;
    if (step === 3) {
      // 시간 있는 상품: 날짜+시간, 시간 없는 상품: 날짜만
      if (classInfo) return !!selectedDate && !!selectedTime;
      return !!selectedDate;
    }
    return false;
  };

  // 전체 구조
  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>예약 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="reservation-container">
          {step < 5 && renderProgressBar()}
          <div className="reservation-content">
            {step === 1 && renderCenterSelectionStep()}
            {step === 2 && renderProductSelectionStep()}
            {step === 3 && renderDateTimeSelectionStep()}
            {step === 4 && renderConfirmationStep()}
            {step === 5 && renderCompletionStep()}
          </div>
          {step < 4 && (
            <div className="navigation-buttons">
              {step > 1 && (
                <button className="back-button" onClick={() => setStep(step - 1)}>
                  이전
                </button>
              )}
              <button
                className="next-button"
                onClick={async () => {
                  // step2→step3로 이동할 때 클래스 정보가 없는 경우(트레이너 상품)라면 여기서 불러오기
                  if (step === 2 && selectedProduct && selectedProduct.trainer_id && !classInfo) {
                    const res = await axios.post(`${apiUrl}/reservation/class_info`, {
                      center_id: selectedProduct.center_id,
                      trainer_id: selectedProduct.trainer_id,
                      product_idx: selectedProduct.product_idx
                    });
                    const cls = (res.data.list || []).find(c => !c.delete);
                    setClassInfo(cls || null);
                    // 트레이너 정보도 세팅
                    const trainer = trainers.find(t => t.trainer_id === selectedProduct.trainer_id);
                    setProductTrainerInfo(trainer || null);
                  }
                  setStep(step + 1);
                }}
                disabled={!canGoNext()}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default function Reservation(){
  return(
    <Suspense>
      <ReservationContent/>
    </Suspense>
  );
};