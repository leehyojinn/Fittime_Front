'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';

const ClassManagement = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [trainers, setTrainers] = useState([
    { user_id: 'trainer1', user_name: '김트레이너' },
    { user_id: 'trainer2', user_name: '박트레이너' },
    { user_id: 'trainer3', user_name: '이트레이너' },
    { user_id: 'trainer4', user_name: '최트레이너' }
  ]);
  const [products, setProducts] = useState([
    { product_id: 1, product_name: '요가 클래스 상품' },
    { product_id: 2, product_name: '필라테스 상품' },
    { product_id: 3, product_name: '크로스핏 상품' },
    { product_id: 4, product_name: '수영 상품' }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  
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

  const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

  const handleAddClass = async(item) => {
    const newClass = {
      start_time: item.start_time,
      end_time: item.end_time,
      week: item.days.join(','),
      max_count: Number(item.max_count),
      trainer_id: 'Lee', // 소속 트레이너 넣기
      center_id: user_id,
    };
    
    const {data} = await axios.post('http://localhost/insert/class',newClass);

    if(data.success){
      setClasses([...classes, newClass]);
      reset();
      alert('등록성공');
    }else{
      alert('등록실패');
    }

  };

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
    setIsEditing(false);
    // 선택한 클래스 정보를 폼에 설정
    setValue('start_time', classItem.start_time);
    setValue('end_time', classItem.end_time);
    setValue('days', classItem.day_of_week.split(','));
    setValue('max_count', classItem.max_count);
    setValue('trainer_id', classItem.trainer_id);
    setValue('product_id', classItem.product_id.toString());
  };

  const handleEditClass = () => {
    setIsEditing(true);
  };

  const handleUpdateClass = (data) => {
    // API 호출하여 클래스 수정
    const selectedTrainer = trainers.find(trainer => trainer.user_id === data.trainer_id);
    const selectedProduct = products.find(product => product.product_id === parseInt(data.product_id));
    
    const updatedClasses = classes.map(classItem => 
      classItem.class_idx === selectedClass.class_idx 
        ? {
            ...classItem,
            start_time: data.start_time,
            end_time: data.end_time,
            day_of_week: data.days.join(','),
            max_count: Number(data.max_count),
            trainer_id: data.trainer_id,
            trainer_name: selectedTrainer?.user_name || '',
            product_id: parseInt(data.product_id),
            product_name: selectedProduct?.product_name || ''
          } 
        : classItem
    );
    
    setClasses(updatedClasses);
    setSelectedClass({
      ...selectedClass,
      start_time: data.start_time,
      end_time: data.end_time,
      day_of_week: data.days.join(','),
      max_count: Number(data.max_count),
      trainer_id: data.trainer_id,
      trainer_name: selectedTrainer?.user_name || '',
      product_id: parseInt(data.product_id),
      product_name: selectedProduct?.product_name || ''
    });
    setIsEditing(false);
  };

  const handleDeleteClass = (classIdx) => {
    if (!window.confirm('정말로 이 클래스를 삭제하시겠습니까?')) return;
    
    // API 호출하여 클래스 삭제
    setClasses(classes.filter(classItem => classItem.class_idx !== classIdx));
    
    if (selectedClass && selectedClass.class_idx === classIdx) {
      setSelectedClass(null);
      reset();
    }
  };

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
                  상품 등록
                </button>
                <div className="class-layout">
                    <div className="class-list-section">
                    <h3 className='middle_title2 mb_20'>클래스 목록</h3>
                    <table className="classes-table">
                        <thead>
                        <tr>
                            <th>요일</th>
                            <th>시작 시간</th>
                            <th>종료 시간</th>
                            <th>수강인원</th>
                            <th>트레이너</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {classes.map((classItem) => (
                            <tr 
                            key={classItem.class_idx}
                            className={selectedClass?.class_idx === classItem.class_idx ? 'selected' : ''}
                            onClick={() => handleSelectClass(classItem)}
                            >
                            <td>{classItem.day_of_week}</td>
                            <td>{classItem.start_time}</td>
                            <td>{classItem.end_time}</td>
                            <td>{classItem.max_count}명</td>
                            <td>{classItem.trainer_name}</td>
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
                        ))}
                        </tbody>
                    </table>
                    </div>
                    
                    <div className="class-form-section">
                    <h3 className='middle_title2 mb_20'>{selectedClass ? (isEditing ? '클래스 수정' : '클래스 상세') : '새 클래스 등록'}</h3>
                    
                    <form onSubmit={handleSubmit(selectedClass && isEditing ? handleUpdateClass : handleAddClass)}>
                        
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
                        <label htmlFor="max_count" className='label'>수강 인원 수</label>
                        <input 
                            id="max_count"
                            type="number"
                            {...register("max_count", { 
                            required: "수강 인원 수를 입력해주세요",
                            min: { value: 1, message: "수강 인원은 1명 이상이어야 합니다" },
                            max: { value: 50, message: "수강 인원은 50명 이하이어야 합니다" }
                            })}
                            disabled={selectedClass && !isEditing}
                        />
                        {errors.max_count && <span className="error-message">{errors.max_count.message}</span>}
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
                        <label htmlFor="product_id" className='label'>연결 상품</label>
                        <select 
                            id="product_id"
                            style={{width:'100%'}}
                            {...register("product_id", { required: "연결할 상품을 선택해주세요" })}
                            disabled={selectedClass && !isEditing}
                        >
                            <option value="">상품 선택</option>
                            {products.map((product) => (
                            <option key={product.product_id} value={product.product_id}>
                                {product.product_name}
                            </option>
                            ))}
                        </select>
                        {errors.product_id && <span className="error-message">{errors.product_id.message}</span>}
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
    </div>
    
  );
};

export default ClassManagement;
