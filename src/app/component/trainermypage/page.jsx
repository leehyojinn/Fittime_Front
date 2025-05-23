'use client'

import React, { useState } from 'react';
import { FaStar, FaCalendarAlt, FaUser, FaEdit, FaCamera, FaPlus } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';

const trainerSample = {
    user_id: 'trainer1',
    user_name: '김트레이너',
    contact: '010-2222-3333',
    email: 'trainer@naver.com',
    gender: '남',
    age: 32,
    address: '서울 강남구',
    profile_image: '/member.png',
    sub_images: ['/member.png','/member.png'],
    tags: ['유경험자','체계적인','친절한'],
    intro: '10년 경력의 퍼스널 트레이너',
    center: {
      center_idx: 1,
      center_name: '헬스월드 강남점',
      address: '서울 강남구 역삼동 123-45',
      contact: '02-1234-5678'
    }
  };
const mockTrainerReservations = [
  { reservation_idx: 1, member_name: '홍길동', contact: '010-1234-5678', date: '2025-05-21', start_time: '10:00', end_time: '11:00', product_name: 'PT 10회', status: '예약완료' }
];
const mockTrainerReviews = [
  { review_id: 1, member_name: '회원A', rating: 5, content: '트레이닝이 정말 체계적이에요!', date: '2025-05-10' }
];
const mockSchedules = [
  { schedule_id: 1, title: '휴무', start_time: '2025-05-22 00:00', end_time: '2025-05-22 23:59', type: '휴무' },
  { schedule_id: 2, title: '1:1 PT', start_time: '2025-05-23 14:00', end_time: '2025-05-23 15:00', type: 'PT' }
];

const TrainerMyPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [trainer, setTrainer] = useState(trainerSample);
  const [mainImage, setMainImage] = useState(trainer.profile_image);
  const [subImages, setSubImages] = useState(trainer.sub_images);

  const handleMainImageChange = e => {
    if (e.target.files[0]) setMainImage(URL.createObjectURL(e.target.files[0]));
  };
  const handleSubImagesChange = e => {
    const files = Array.from(e.target.files).slice(0, 10);
    setSubImages(files.map(f => URL.createObjectURL(f)));
  };

  return (

    <div>
        <Header/>
        <div className='wrap padding_120_0'>

            <div className="mypage-container">
            <h2 className='middle_title2'>트레이너 마이페이지</h2>
            <div className="mypage-profile">
                <img src={trainer.profile_image} alt="프로필" className="mypage-profile-img" />
                {editMode && (
                <label className="btn white_color label">
                    <FaCamera /> 대표이미지 변경
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleMainImageChange} />
                </label>
                )}
                <div className="mypage-subimg-list">
                    {subImages.map((img, idx) => (
                    <img key={idx} src={img} alt="트레이너 추가 이미지" className="mypage-subimg" />
                    ))}
                    {editMode && subImages.length < 10 && (
                    <label className="btn white_color label">
                        <FaPlus /> 추가이미지
                        <input type="file" multiple accept="image/*" style={{display:'none'}} onChange={handleSubImagesChange} />
                    </label>
                    )}
                </div>
                <div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">이름</span>
                    <span className="label font_weight_400">{trainer.user_name}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">아이디</span>
                    <span className="label font_weight_400">{trainer.user_id}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">연락처</span>
                    {editMode ? <input className='width_fit' defaultValue={trainer.contact} /> : <span className="label font_weight_400">{trainer.contact}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">이메일</span>
                    {editMode ? <input className='width_fit' defaultValue={trainer.email} /> : <span className="label font_weight_400">{trainer.email}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">성별/나이</span>
                    <span className="label font_weight_400">{trainer.gender} / {trainer.age}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">주소</span>
                    {editMode ? <input className='width_fit' defaultValue={trainer.address} /> : <span className="label font_weight_400">{trainer.address}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">소속센터</span>
                    <span className="label font_weight_400">{trainer.center.center_name} ({trainer.center.address})</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">센터 연락처</span>
                    <span className="label font_weight_400">{trainer.center.contact}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">태그</span>
                    {trainer.tags.map((item,idx)=>{
                        return(<span key={idx} className="mypage_tag">{item}</span>);
                    })}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">소개</span>
                    {editMode ? <textarea className='width_fit' defaultValue={trainer.intro} /> : <span className="label font_weight_400">{trainer.intro}</span>}
                </div>
                <button className="btn white_color label mr_10" onClick={() => setEditMode(!editMode)}>
                    <FaEdit /> {editMode ? '수정완료' : '정보수정'}
                </button>
                <button className="btn white_color label">
                    <FaEdit /> 태그추가
                </button>
                </div>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 예약 내역</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원</th><th>연락처</th><th>상품</th><th>날짜</th><th>시간</th><th>상태</th></tr>
                </thead>
                <tbody>
                    {mockTrainerReservations.map(r=>(
                    <tr key={r.reservation_idx}>
                        <td>{r.member_name}</td>
                        <td>{r.contact}</td>
                        <td>{r.product_name}</td>
                        <td>{r.date}</td>
                        <td>{r.start_time}~{r.end_time}</td>
                        <td>{r.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaStar /> 받은 리뷰</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원</th><th>별점</th><th>내용</th><th>작성일</th></tr>
                </thead>
                <tbody>
                    {mockTrainerReviews.map(r=>(
                    <tr key={r.review_id}>
                        <td>{r.member_name}</td>
                        <td>{r.rating}</td>
                        <td>{r.content}</td>
                        <td>{r.date}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 내 스케줄</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>일정명</th><th>시작</th><th>종료</th><th>구분</th></tr>
                </thead>
                <tbody>
                    {mockSchedules.map(s=>(
                    <tr key={s.schedule_id}>
                        <td>{s.title}</td>
                        <td>{s.start_time}</td>
                        <td>{s.end_time}</td>
                        <td>{s.type}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        <Footer/>
    </div>  
  );
};

export default TrainerMyPage;
