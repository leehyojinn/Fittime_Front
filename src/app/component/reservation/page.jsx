'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaMapMarkerAlt, FaClock, FaCheckCircle, FaStar } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';

const Reservation = () => {
  const searchParams = useSearchParams();
  const initialCenterId = searchParams.get('center_id');
  const initialTrainerId = searchParams.get('trainer_id');

  // 상태
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  // 센터 정보 불러오기 (센터 전체 목록 API가 없으니 임시로 하나만)
  useEffect(() => {
    axios.post('http://localhost/reservation/center_info/realcenter')
      .then(res => {
        setCenters(res.data.list || []);
        if (res.data.list && res.data.list.length > 0) {
          setSelectedCenter(res.data.list[0]);
        }
      });
  }, []);

  // 센터/트레이너 자동 선택
  useEffect(() => {
    if (!centers.length) return;
    // 센터 예약 진입
    if (initialCenterId) {
      const center = centers.find(c => String(c.center_id) === String(initialCenterId));
      if (center) setSelectedCenter(center);
    }
    // 트레이너 예약 진입
    if (initialTrainerId && !selectedTrainer) {
      axios.post(`http://localhost/reservation/trainer_info/${initialCenterId}`)
        .then(res => {
          const trainer = res.data.list?.find(t => String(t.trainer_id) === String(initialTrainerId));
          if (trainer) setSelectedTrainer(trainer);
          if (initialCenterId) {
            const center = centers.find(c => String(c.center_id) === String(initialCenterId));
            if (center) setSelectedCenter(center);
          }
        });
    }
  }, [centers, initialCenterId, initialTrainerId, selectedTrainer]);

  // 센터 선택 시 상품/트레이너/클래스 불러오기
  useEffect(() => {
    if (!selectedCenter) return;
    axios.post(`http://localhost/reservation/center_product/${selectedCenter.center_id}`)
      .then(res => setProducts(res.data.list || []));
    axios.post(`http://localhost/reservation/trainer_info/${selectedCenter.center_id}`)
      .then(res => setTrainers(res.data.list || []));
    axios.post('http://localhost/reservation/class_info', { center_id: selectedCenter.center_id })
      .then(res => setClasses(res.data.list || []));
  }, [selectedCenter]);

  // 상품 선택시 트레이너/클래스/날짜/시간 리셋
  useEffect(() => {
    setSelectedTrainer(null);
    setSelectedClass(null);
    setSelectedDate(new Date());
    setSelectedTime('');
  }, [selectedProduct]);

  // 트레이너 예약 진입 시 자동으로 2단계(상품/트레이너)로 이동
  useEffect(() => {
    if (selectedTrainer && selectedCenter) setStep(2);
    else if (selectedCenter) setStep(1);
  }, [selectedCenter, selectedTrainer]);

  // 날짜 변경 시 시간 업데이트
  useEffect(() => {
    if (!selectedProduct) return setAvailableTimes([]);
    if (selectedProduct.service_level === 1) {
      setAvailableTimes([]);
    } else if (selectedProduct.service_level === 2) {
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
      const availableClasses = classes.filter(cls =>
        cls.week.includes(dayOfWeek) && cls.product_idx === selectedProduct.product_idx
      );
      setAvailableTimes(availableClasses.map(cls => ({
        time: cls.start_time,
        endTime: cls.end_time,
        className: cls.class_name
      })));
    } else if (selectedProduct.service_level === 3) {
      if (selectedTrainer) {
        const availableHours = [];
        for (let i = 10; i <= 20; i++) {
          if (i !== 13) {
            availableHours.push({
              time: `${i}:00`,
              endTime: `${i + 1}:00`
            });
          }
        }
        setAvailableTimes(availableHours);
      }
    }
  }, [selectedDate, selectedProduct, selectedTrainer, classes]);

  // 가격 계산
  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    const discountAmount = selectedProduct.price * (selectedProduct.discount_rate / 100);
    return selectedProduct.price - discountAmount;
  };

  // 예약 생성
  const handleSubmitReservation = () => {
    setIsSubmitting(true);
    const param = {
      center_id: selectedCenter.center_id,
      product_idx: selectedProduct.product_idx,
      trainer_id: selectedTrainer?.trainer_id,
      class_idx: selectedClass?.class_idx,
      date: selectedDate.toISOString().slice(0, 10),
      time: selectedTime.time || selectedTime
    };
    axios.post('http://localhost/booking', param)
      .then(res => {
        setIsSubmitting(false);
        if (res.data.success) {
          setResultMsg('예약이 완료되었습니다!');
          setStep(5);
        } else {
          setResultMsg('예약에 실패했습니다. 인원 초과 또는 오류');
        }
      })
      .catch(() => {
        setIsSubmitting(false);
        setResultMsg('예약 중 오류가 발생했습니다.');
      });
  };

  // --- 렌더링 함수들 ---
  const renderCenterSelectionStep = () => (
    <div className="reservation-section">
      <h3>운동 기관 선택</h3>
      <div className="center-list">
        {centers.map(center => (
          <div
            key={center.center_id}
            className={`center-card ${selectedCenter?.center_id === center.center_id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCenter(center);
              setSelectedProduct(null);
              setSelectedTrainer(null);
            }}
          >
            <div className="center-info">
              <h4>{center.center_name}</h4>
              <p className="center-address"><FaMapMarkerAlt /> {center.address}</p>
              <p className="center-rating"><FaStar /> {center.avg_rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const filteredProducts = selectedCenter
    ? products.filter(product => product.center_id === selectedCenter.center_id)
    : [];
  const filteredTrainers = selectedCenter
    ? trainers.filter(trainer => trainer.center_id === selectedCenter.center_id)
    : [];
  const selectedProductLevel = selectedProduct?.service_level;

  const renderProductSelectionStep = () => (
    <div className="reservation-section">
      <div className="selection-container">
        <div className="product-selection">
          <h3>상품 선택</h3>
          <div className="product-list">
            {filteredProducts.map(product => (
              <div
                key={product.product_idx}
                className={`product-card ${selectedProduct?.product_idx === product.product_idx ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedTrainer(null);
                  setAvailableTimes([]);
                }}
              >
                <h4>{product.product_name}</h4>
                <p className="product-price">
                  {product.discount_rate > 0 ? (
                    <>
                      <span className="original-price">{product.price.toLocaleString()}원</span>
                      <span className="discount-rate">{product.discount_rate}% 할인</span>
                      <span className="final-price">
                        {(product.price * (1 - product.discount_rate / 100)).toLocaleString()}원
                      </span>
                    </>
                  ) : (
                    <span className="final-price">{product.price.toLocaleString()}원</span>
                  )}
                </p>
                {product.max_people > 0 && (
                  <p className="product-count">수강 인원: {product.max_people}명</p>
                )}
              </div>
            ))}
          </div>
        </div>
        {selectedProductLevel === 3 && (
          <div className="trainer-selection">
            <h3>트레이너 선택</h3>
            <div className="trainer-list">
              {filteredTrainers.map(trainer => (
                <div
                  key={trainer.trainer_id}
                  className={`trainer-card ${selectedTrainer?.trainer_id === trainer.trainer_id ? 'selected' : ''}`}
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <div className="trainer-info">
                    <h4>{trainer.trainer_name || trainer.trainer_id}</h4>
                    <p className="trainer-rating"><FaStar /> {trainer.avg_rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDateTimeSelectionStep = () => (
    <div className="reservation-section">
      <div className="datetime-container">
        <div className="date-selection">
          <h3>날짜 선택</h3>
          <div className="calendar-wrapper">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              className="reservation-calendar"
            />
          </div>
        </div>
        {selectedProductLevel !== 1 && (
          <div className="time-selection">
            <h3>시간 선택</h3>
            {availableTimes.length > 0 ? (
              <div className="time-slots">
                {availableTimes.map((timeSlot, idx) => (
                  <div
                    key={idx}
                    className={`time-slot ${selectedTime === timeSlot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(timeSlot)}
                  >
                    <FaClock /> {timeSlot.time} - {timeSlot.endTime}
                    {timeSlot.className && <span className="class-name">{timeSlot.className}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                {selectedProductLevel === 1
                  ? "자유 이용권은 시간 선택이 필요 없습니다."
                  : "선택한 날짜에 예약 가능한 시간이 없습니다."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="reservation-section">
      <h3>예약 정보 확인</h3>
      <div className="confirmation-details">
        <div className="detail-item">
          <span className="label">센터:</span>
          <span className="value">{selectedCenter.center_name}</span>
        </div>
        <div className="detail-item">
          <span className="label">상품:</span>
          <span className="value">{selectedProduct.product_name}</span>
        </div>
        {selectedProductLevel === 3 && (
          <div className="detail-item">
            <span className="label">트레이너:</span>
            <span className="value">{selectedTrainer?.trainer_name || selectedTrainer?.trainer_id}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="label">예약 날짜:</span>
          <span className="value">{selectedDate.toLocaleDateString()}</span>
        </div>
        {selectedProductLevel !== 1 && selectedTime && (
          <div className="detail-item">
            <span className="label">예약 시간:</span>
            <span className="value">{selectedTime.time} - {selectedTime.endTime}</span>
          </div>
        )}
        <div className="detail-item price">
          <span className="label">최종 가격:</span>
          <span className="value final-price">{calculateFinalPrice().toLocaleString()}원</span>
        </div>
        <div className="payment-methods">
          <h4>결제 수단 선택</h4>
          <div className="payment-options">
            <label className="payment-option">
              <input type="radio" name="payment" value="card" defaultChecked />
              <span>카드 결제</span>
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" value="transfer" />
              <span>계좌 이체</span>
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" value="kakao" />
              <span>카카오페이</span>
            </label>
          </div>
        </div>
        <button
          className="submit-button"
          onClick={handleSubmitReservation}
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '예약 및 결제하기'}
        </button>
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
            <span className="value">R{Date.now().toString().substring(5)}</span>
          </div>
          <div className="detail-item">
            <span className="label">센터:</span>
            <span className="value">{selectedCenter.center_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">상품:</span>
            <span className="value">{selectedProduct.product_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">날짜:</span>
            <span className="value">{selectedDate.toLocaleDateString()}</span>
          </div>
          {selectedTime && (
            <div className="detail-item">
              <span className="label">시간:</span>
              <span className="value">{selectedTime.time} - {selectedTime.endTime}</span>
            </div>
          )}
        </div>
        <div className="action-buttons">
          <button className="primary-button" onClick={() => window.location.href = '/mypage'}>
            예약 내역 확인
          </button>
          <button className="secondary-button" onClick={() => window.location.href = '/'}>
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const steps = [
      { number: 1, name: '센터 선택' },
      { number: 2, name: '상품/트레이너' },
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
    if (step === 2) return !!selectedProduct && (selectedProductLevel !== 3 || !!selectedTrainer);
    if (step === 3) {
      if (selectedProductLevel === 1) return !!selectedDate;
      return !!selectedDate && (availableTimes.length === 0 || !!selectedTime);
    }
    return false;
  };

  // 전체 구조
  return (
    <div>
      <Header />
      <div className='wrap padding_120_0'>
        <div className="reservation-container">
          <h2 className="middle_title mb_20">예약하기</h2>
          {step < 4 && renderProgressBar()}
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
                onClick={() => setStep(step + 1)}
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

export default Reservation;
