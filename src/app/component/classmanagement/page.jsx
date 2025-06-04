'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';
import { useAlertModalStore } from '@/app/zustand/store';
import AlertModal from '../alertmodal/page';

const ClassManagement = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // user_id, exercise_level 안전하게 useEffect에서 읽기
  const [userId, setUserId] = useState('');
  const [exerciseLevel, setExerciseLevel] = useState('');

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(sessionStorage.getItem("user_id") || "");
      setExerciseLevel(sessionStorage.getItem("exercise_level") || "");
    }
  }, []);

  // 트레이너 리스트 불러오기
  const trainer_list = async (uid) => {
    let { data } = await axios.post(`http://localhost/list/trainers/${uid}`);
    if (data) {
      const newTrainers = data.trainers.map((item) => ({
        user_id: item.trainer_id,
        user_name: item.name,
      }));
      setTrainers(newTrainers);
    }
  };

  // 상품 리스트 불러오기 (max_people 포함)
  const product_list = async(uid) => {
    let {data} = await axios.post('http://localhost/list/product',{center_id : uid});
    if(data){
      const newProducts = data.products.map((item)=>({
        product_idx : item.product_idx,
        product_name : item.product_name,
        max_people : item.max_people,
        status : item.status
      }));
      setProducts(newProducts);
    }
  }

  // 클래스 리스트 불러오기 (상품명/트레이너명은 렌더링시 매번 찾아서 표시)
  const class_list = async(uid) => {
    let {data} = await axios.post("http://localhost/list/class",{center_id : uid});
    if(data && data.list) {
      setClasses(data.list);
    }
  }

  // userId 준비 후, trainers/products/class_list 순차적으로 불러오기
  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      await trainer_list(userId);
      await product_list(userId);
      await class_list(userId); // 항상 서버에서 최신 리스트를 불러옴
    };
    fetchAll();
  }, [userId]);

  // AlertModal 활용: 등록
  const handleAddClass = async(item) => {
    const newClass = {
      product_idx : item.product_idx,
      start_time: item.start_time,
      end_time: item.end_time,
      week: item.days.join(','),
      trainer_id: item.trainer_id,
      center_id: userId,
    };

    try {
      const {data} = await axios.post('http://localhost/insert/class',newClass);
      if(data.success){
        reset();
        useAlertModalStore.getState().openModal({
          svg: '✔',
          msg1: "등록 완료",
          msg2: "클래스가 정상적으로 등록되었습니다.",
          showCancel: false,
          onConfirm: async () => { await class_list(userId); }
        });
      }else{
        useAlertModalStore.getState().openModal({
          svg: '❗',
          msg1: "등록 실패",
          msg2: "클래스 등록에 실패했습니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      useAlertModalStore.getState().openModal({
        svg: '❗',
        msg1: "오류",
        msg2: "네트워크 오류가 발생했습니다.",
        showCancel: false,
      });
    }
  };

  // 클래스 선택(상세/수정용)
  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
    setIsEditing(false);

    // 시간 포맷 맞추기 ("10:30:00" → "10:30")
    const formatTime = (t) => t ? t.slice(0,5) : '';

    setValue('start_time', formatTime(classItem.start_time));
    setValue('end_time', formatTime(classItem.end_time));
    setValue('days', (classItem.week || '').split(','));
    setValue('trainer_id', classItem.trainer_id);
    setValue('product_idx', classItem.product_idx.toString());
  };

  // 수정모드 진입
  const handleEditClass = () => {
    setIsEditing(true);
  };

  // AlertModal 활용: 수정
  const handleUpdateClass = async (data) => {
    if (!selectedClass) return;
    const updateParam = {
      class_idx: selectedClass.class_idx,
      trainer_id: data.trainer_id,
      product_idx: Number(data.product_idx),
      start_time: data.start_time,
      end_time: data.end_time,
      week: data.days.join(','),
    };
    try {
      const res = await axios.post('http://localhost/update/class', updateParam);
      if (res.data.success) {
        setIsEditing(false);
        useAlertModalStore.getState().openModal({
          svg: '✔',
          msg1: "수정 완료",
          msg2: "클래스가 정상적으로 수정되었습니다.",
          showCancel: false,
          onConfirm: async () => { await class_list(userId); }
        });
      } else {
        useAlertModalStore.getState().openModal({
          svg: '❗',
          msg1: "수정 실패",
          msg2: "클래스 수정에 실패했습니다.",
          showCancel: false,
        });
      }
    } catch (err) {
      useAlertModalStore.getState().openModal({
        svg: '❗',
        msg1: "오류",
        msg2: "수정 중 오류가 발생했습니다.",
        showCancel: false,
      });
    }
  };

  // AlertModal 활용: 삭제
  const handleDeleteClass = (classIdx) => {
    useAlertModalStore.getState().openModal({
      svg: '❗',
      msg1: "삭제 확인",
      msg2: "정말로 이 클래스를 삭제하시겠습니까?",
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`http://localhost/del/class/${classIdx}`);
          if (res.data.success) {
            if (selectedClass && selectedClass.class_idx === classIdx) {
              setSelectedClass(null);
              reset();
            }
            useAlertModalStore.getState().openModal({
              svg: '✔',
              msg1: "삭제 완료",
              msg2: "클래스가 삭제되었습니다.",
              showCancel: false,
              onConfirm: async () => { await class_list(userId); }
            });
          } else {
            useAlertModalStore.getState().openModal({
              svg: '❗',
              msg1: "삭제 실패",
              msg2: "클래스 삭제에 실패했습니다.",
              showCancel: false,
            });
          }
        } catch (err) {
          useAlertModalStore.getState().openModal({
            svg: '❗',
            msg1: "오류",
            msg2: "삭제 중 오류가 발생했습니다.",
            showCancel: false,
          });
        }
      }
    });
  };

  // 시간 옵션
  const getTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        options.push(`${hourStr}:${minuteStr}`);
      }
    }
    return options;
  };
  const timeOptions = getTimeOptions();

  const handleFormReset = () => {
    setSelectedClass(null);
    setIsEditing(false);
    reset();
  };

  const days = [
    { value: '월', label: '월' },
    { value: '화', label: '화' },
    { value: '수', label: '수' },
    { value: '목', label: '목' },
    { value: '금', label: '금' },
    { value: '토', label: '토' },
    { value: '일', label: '일' }
  ];

  const selectedDays = watch('days') || [];

  // AlertModal 활용: 유효성 오류
  const onError = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    useAlertModalStore.getState().openModal({
      svg: '❗',
      msg1: "입력 오류",
      msg2: firstError?.message || "필수 입력값을 확인해주세요.",
      showCancel: false,
    });
  };

  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>클래스 등록 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="class-management-container">
          <h2 className='middle_title2 mb_20'>클래스 관리</h2>
          <button 
            className='btn label white_color'
            onClick={handleFormReset}
            type="button"
          >
            클래스 등록
          </button>
          <div className="class-layout">
            <div className="class-list-section">
              <h3 className='middle_title2 mb_20'>클래스 목록</h3>
              <table className="classes-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>요일</th>
                    <th>시작 시간</th>
                    <th>종료 시간</th>
                    <th>상품 최대인원</th>
                    <th>트레이너</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classItem) => {
                    const product = products.find(p => String(p.product_idx) === String(classItem.product_idx));
                    const trainer = trainers.find(t => t.user_id === classItem.trainer_id);
                    return (
                      <tr 
                        key={classItem.class_idx}
                        className={selectedClass?.class_idx === classItem.class_idx ? 'selected' : ''}
                        onClick={() => handleSelectClass(classItem)}
                      >
                        <td>{product ? product.product_name : ''}</td>
                        <td>{classItem.week}</td>
                        <td>{classItem.start_time}</td>
                        <td>{classItem.end_time}</td>
                        <td>{product ? product.max_people : ''}명</td>
                        <td>{trainer ? trainer.user_name : ''}</td>
                        <td>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(classItem.class_idx);
                            }} 
                            className="delete-button"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="class-form-section">
              <h3 className='middle_title2 mb_20'>{selectedClass ? (isEditing ? '클래스 수정' : '클래스 상세') : '새 클래스 등록'}</h3>
              <form onSubmit={handleSubmit(selectedClass && isEditing ? handleUpdateClass : handleAddClass, onError)}>
                <div className="form-group">
                  <label htmlFor="days" className='label'>운영 요일</label>
                  <div className="checkbox-group flex align_center">
                    {days.map((day) => (
                      <div key={day.value} className="checkbox-item flex_1 align_center">
                        <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          value={day.value}
                          {...register("days", { required: "최소 하나의 요일을 선택해주세요" })}
                          disabled={selectedClass && !isEditing}
                        />
                        <label htmlFor={`day-${day.value}`} className='label'>{day.label}</label>
                      </div>
                    ))}
                  </div>
                  {errors.days && <span className="error-message">{errors.days.message}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="start_time" className='label'>시작 시간</label>
                    <select 
                      id="start_time"
                      {...register("start_time", { required: "시작 시간을 선택해주세요" })}
                      disabled={selectedClass && !isEditing}
                      style={{width:'100%'}}
                    >
                      <option value="">시작 시간 선택</option>
                      {timeOptions.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.start_time && <span className="error-message">{errors.start_time.message}</span>}
                  </div>
                  <div className="form-group half">
                    <label htmlFor="end_time" className='label'>종료 시간</label>
                    <select 
                      id="end_time"
                      style={{width:'100%'}}
                      {...register("end_time", { 
                        required: "종료 시간을 선택해주세요",
                        validate: value => {
                          const start = watch('start_time');
                          return !start || value > start || "종료 시간은 시작 시간보다 늦어야 합니다";
                        }
                      })}
                      disabled={selectedClass && !isEditing}
                    >
                      <option value="">종료 시간 선택</option>
                      {timeOptions.map((time) => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.end_time && <span className="error-message">{errors.end_time.message}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="trainer_id" className='label'>트레이너</label>
                  <select 
                    id="trainer_id"
                    style={{width:'100%'}}
                    {...register("trainer_id", { required: "트레이너를 선택해주세요" })}
                    disabled={selectedClass && !isEditing}
                  >
                    <option value="">트레이너 선택</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.user_id} value={trainer.user_id}>
                        {trainer.user_name}
                      </option>
                    ))}
                  </select>
                  {errors.trainer_id && <span className="error-message">{errors.trainer_id.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="product_idx" className='label'>연결 상품</label>
                  <select 
                    id="product_idx"
                    style={{width:'100%'}}
                    {...register("product_idx", { required: "연결할 상품을 선택해주세요" })}
                    disabled={selectedClass && !isEditing}
                  >
                    <option value="">상품 선택</option>
                      {products
                        .filter(product => Number(product.status) === 1)
                        .map(product => (
                          <option key={product.product_idx} value={product.product_idx}>
                            {product.product_name}
                          </option>
                        ))}
                  </select>
                  {errors.product_idx && <span className="error-message">{errors.product_idx.message}</span>}
                </div>
                
                <div className="form-buttons">
                  {!selectedClass && (
                    <button type="submit" className="submit-button">클래스 등록</button>
                  )}
                  {selectedClass && !isEditing && (
                    <button 
                      type="button" 
                      onClick={handleEditClass}
                      className="btn label white_color"
                    >
                      수정하기
                    </button>
                  )}
                  {selectedClass && isEditing && (
                    <>
                      <button type="submit" className="save-button">저장하기</button>
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="cancel-button"
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      <AlertModal/>
    </div>
  );
};

export default ClassManagement;
