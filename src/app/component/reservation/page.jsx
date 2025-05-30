'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaMapMarkerAlt, FaClock, FaCheckCircle, FaStar } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';

const Reservation = () => {
  const searchParams = useSearchParams();
  const initialCenterIdx = searchParams.get('center_idx');
  const initialTrainerId = searchParams.get('trainer_id');

  // 상태
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 데이터 샘플 (실제에선 API)
  const centersData = [
    { center_idx: 1, center_name: '헬스월드 강남점', address: '서울 강남구 역삼동 123-45', contact: '02-1234-5678', image: '/center1.jpg', rating: 4.7 },
    { center_idx: 2, center_name: '피트니스클럽 송파점', address: '서울 송파구 잠실동 456-78', contact: '02-2345-6789', image: '/center2.jpg', rating: 4.5 },
    { center_idx: 3, center_name: '웰니스 필라테스', address: '서울 서초구 서초동 789-10', contact: '02-3456-7890', image: '/center3.jpg', rating: 4.9 }
  ];
  const trainersData = [
    { user_id: 'trainer1', user_name: '김트레이너', profile_image: '/trainer1.jpg', center_idx: 1, exercise_type: 'PT', rating: 4.8 },
    { user_id: 'trainer2', user_name: '박트레이너', profile_image: '/trainer2.jpg', center_idx: 1, exercise_type: '필라테스', rating: 4.9 },
    { user_id: 'trainer3', user_name: '이트레이너', profile_image: '/trainer3.jpg', center_idx: 2, exercise_type: '요가', rating: 4.7 }
  ];
  const productsData = [
    { product_idx: 1, product_name: '헬스 1개월 이용권', price: 100000, discount_rate: 10, max_count: 0, service_level: 1, center_idx: 1 },
    { product_idx: 2, product_name: 'PT 10회 이용권', price: 300000, discount_rate: 5, max_count: 1, service_level: 3, center_idx: 1 },
    { product_idx: 3, product_name: '필라테스 클래스 8회', price: 240000, discount_rate: 0, max_count: 8, service_level: 2, center_idx: 1 },
    { product_idx: 4, product_name: '헬스 3개월 이용권', price: 250000, discount_rate: 15, max_count: 0, service_level: 1, center_idx: 2 }
  ];
  const classesData = [
    { class_idx: 1, class_name: '필라테스 초급반', start_time: '10:00', end_time: '11:00', day_of_week: '월,수,금', max_count: 10, trainer_id: 'trainer2', product_id: 3 },
    { class_idx: 2, class_name: '요가 중급반', start_time: '14:00', end_time: '15:00', day_of_week: '화,목', max_count: 8, trainer_id: 'trainer3', product_id: 3 }
  ];

  // 진입 시 센터/트레이너 자동 선택
  useEffect(() => {
    if (initialCenterIdx && !selectedCenter) {
      const center = centersData.find(c => String(c.center_idx) === String(initialCenterIdx));
      if (center) setSelectedCenter(center);
    }
    if (initialTrainerId && !selectedTrainer) {
      const trainer = trainersData.find(t => String(t.user_id) === String(initialTrainerId));
      if (trainer) {
        setSelectedTrainer(trainer);
        const center = centersData.find(c => c.center_idx === trainer.center_idx);
        if (center) setSelectedCenter(center);
      }
    }
  }, [initialCenterIdx, initialTrainerId, centersData, trainersData]);

  // 자동 단계 이동
  useEffect(() => {
    if (selectedTrainer && selectedCenter) setStep(2);
    else if (selectedCenter) setStep(1);
  }, [selectedCenter, selectedTrainer]);

  // 센터 선택
  const filteredCenters = centersData;

  // 상품/트레이너 필터
  const filteredProducts = selectedCenter
    ? productsData.filter(product => product.center_idx === selectedCenter.center_idx)
    : [];
  const filteredTrainers = selectedCenter
    ? trainersData.filter(trainer => trainer.center_idx === selectedCenter.center_idx)
    : [];

  // 상품 선택시 트레이너 필요 여부
  const selectedProductLevel = selectedProduct?.service_level;

  // 날짜 변경 시 시간 업데이트
  useEffect(() => {
    if (!selectedProduct) return setAvailableTimes([]);
    // 자유이용권(1): 시간선택X, 클래스(2): 해당 요일 클래스, PT(3): 1시간 단위
    if (selectedProduct.service_level === 1) {
      setAvailableTimes([]);
    } else if (selectedProduct.service_level === 2) {
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()];
      const availableClasses = classesData.filter(cls =>
        cls.day_of_week.includes(dayOfWeek) && cls.product_id === selectedProduct.product_idx
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
  }, [selectedDate, selectedProduct, selectedTrainer]);

  // 단계 렌더링
  const renderCenterSelectionStep = () => (
    <div className="reservation-section">
      <h3>운동 기관 선택</h3>
      <div className="center-list">
        {filteredCenters.map(center => (
          <div
            key={center.center_idx}
            className={`center-card ${selectedCenter?.center_idx === center.center_idx ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCenter(center);
              setSelectedProduct(null);
              setSelectedTrainer(null);
            }}
          >
            <div className="center-image">
              <img src={center.image || '/default-center.jpg'} alt={center.center_name} />
            </div>
            <div className="center-info">
              <h4>{center.center_name}</h4>
              <p className="center-address"><FaMapMarkerAlt /> {center.address}</p>
              <p className="center-rating"><FaStar /> {center.rating.toFixed(1)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
                {product.max_count > 0 && (
                  <p className="product-count">수강 인원: {product.max_count}명</p>
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
                  key={trainer.user_id}
                  className={`trainer-card ${selectedTrainer?.user_id === trainer.user_id ? 'selected' : ''}`}
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <div className="trainer-image">
                    <img src={trainer.profile_image || '/default-trainer.jpg'} alt={trainer.user_name} />
                  </div>
                  <div className="trainer-info">
                    <h4>{trainer.user_name}</h4>
                    <p className="trainer-type">{trainer.exercise_type}</p>
                    <p className="trainer-rating"><FaStar /> {trainer.rating.toFixed(1)}</p>
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

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    const discountAmount = selectedProduct.price * (selectedProduct.discount_rate / 100);
    return selectedProduct.price - discountAmount;
  };

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
            <span className="value">{selectedTrainer?.user_name}</span>
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

  const handleSubmitReservation = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5);
    }, 1500);
  };

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

  // 단계 진행바
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

  // 다음/이전 버튼
  const canGoNext = () => {
    if (step === 1) return !!selectedCenter;
    if (step === 2) return !!selectedProduct && (selectedProductLevel !== 3 || !!selectedTrainer);
    if (step === 3) {
      if (selectedProductLevel === 1) return !!selectedDate;
      return !!selectedDate && (availableTimes.length === 0 || !!selectedTime);
    }
    return false;
  };

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
