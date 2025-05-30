'use client'

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaStar, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import KakaoMap from '../map/kakaomap';
import axios from 'axios';

const centerSample = {
  center_idx: 1,
  center_name: '헬스월드 강남점',
  address: '서울시 성북구 장위동 316-2',
  contact: '02-1234-5678',
  image: '/center1.jpg',
  intro: '최신 장비와 쾌적한 환경의 24시간 프리미엄 헬스장',
  tags: ['24시간', '샤워시설', '주차가능'],
  rating: 4.7,
  reviews: [
    { review_id: 1, user_name: '회원A', rating: 5, content: '시설이 정말 깨끗하고 좋아요!', date: '2025-05-01', images: [] },
    { review_id: 2, user_name: '회원B', rating: 4.5, content: '트레이너도 친절하고 만족합니다.', date: '2025-05-02', images: [] }
  ]
};

const CenterDetail = () => {
  const [reviewText, setReviewText] = useState('');
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [files, setFiles] = useState([]);
  const [reviews, setReviews] = useState([]);

  // 별점 클릭/호버
  const handleStarClick = (value) => setStar(value);
  const handleStarHover = (value) => setHoverStar(value);
  const handleStarOut = () => setHoverStar(0);

  // 파일 업로드
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 5);
    setFiles(newFiles);
  };

  // 리뷰 등록
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (star < 0.5) return alert('별점을 입력해주세요.');
    if (reviewText.trim().length < 15) return alert('리뷰를 15자 이상 입력해주세요.');
    if (files.some(f => f.size > 10 * 1024 * 1024)) return alert('각 이미지는 10MB 이하만 가능합니다.');
    setReviews([
      {
        review_id: Date.now(),
        user_name: Date.now(), // 실제론 로그인 회원명
        rating: star,
        content: reviewText,
        date: new Date().toISOString().slice(0, 10),
        images: files.map(f => URL.createObjectURL(f))
      },
      ...reviews
    ]);
    setReviewText('');
    setStar(0);
    setFiles([]);
  };

  // 별점 평균/참여인원
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(2) : '-';

  const insertReview = async() =>{
    const formData = new FormData();
    if (files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    formData.append("user_id", sessionStorage.getItem('user_id')); // 로그인된 사용자 ID
    formData.append("rating", star);
    formData.append("content", reviewText);
    formData.append("target_id",'center'); 
    formData.append("reservation_idx",8);
    const {data} = await axios.post('http://localhost:/insert/review', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log(data);
  }
  React.useEffect(() => {
    
  
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    const {data} = await axios.post('http://localhost/list/review/1');
    console.log(data);
    // setCenter(data.center_idx);
    setReviews(data);
};

// 초기 리뷰 데이터 설정
// React.useEffect(() => {
//     const fetchReviews = async () => {
//         const response = await fetch(`http://localhost/list/review/1`);
//         const data = await response.json();
//         setReviews(data.reviews || []);
//     };
//     fetchReviews();
//   }, []);


  return (
    <div>
        <Header/>
        <div className='wrap padding_120_0'>
            <div className="center-detail-container">
            <div className="center-header">
                <img src={centerSample.image} alt={centerSample.center_name} className="center-main-image" />
                <div className="center-header-info">
                <h2>{centerSample.center_name}</h2>
                <div className="center-tags">
                    {centerSample.tags.map(tag => <span key={tag} className="center-tag">{tag}</span>)}
                </div>
                <div className="center-rating">
                    <FaStar /> {avgRating} <span style={{fontSize:'0.92rem',color:'#888'}}>({reviews.length}명)</span>
                </div>
                <div className="center-contact">
                    <FaMapMarkerAlt /> {centerSample.address}
                    <span className="center-contact-phone"><FaPhoneAlt /> {centerSample.contact}</span>
                </div>
                </div>
            </div>
            <div className="center-intro">
                <h4>센터 소개</h4>
                <p>{centerSample.intro}</p>
                <Link href={'/component/reservation'}>
                    <div className="review-submit-btn width_fit">예약 하기</div>
                </Link>
            </div>
            <div style={{margin:'50px 0'}}>
                <KakaoMap address={centerSample.address}/>
            </div>
            {/* 리뷰 작성 인풋 */}
            <div className="center-review-write">
                <h4>리뷰 작성</h4>
                <form onSubmit={handleReviewSubmit}>
                <div className="star-input">
                    {[1,2,3,4,5].map(i=>(
                    <span key={i} style={{position:'relative',display:'inline-block'}}>
                        <FaStar
                        className="star"
                        color={((hoverStar||star) >= i) ? '#FFC107' : '#e4e5e9'}
                        onMouseEnter={()=>handleStarHover(i)}
                        onMouseLeave={handleStarOut}
                        onClick={()=>handleStarClick(i)}
                        style={{cursor:'pointer',fontSize:'2rem'}}
                        />
                        {/* 0.5점 지원 */}
                        <FaStar
                        className="star half"
                        color={((hoverStar||star) >= i-0.5) && ((hoverStar||star)<i) ? '#FFC107':'transparent'}
                        style={{
                            cursor:'pointer',
                            fontSize:'2rem',
                            position:'absolute',
                            left:0,
                            zIndex:1,
                            clipPath:'inset(0 50% 0 0)'
                        }}
                        onMouseEnter={()=>handleStarHover(i-0.5)}
                        onMouseLeave={handleStarOut}
                        onClick={()=>handleStarClick(i-0.5)}
                        />
                    </span>
                    ))}
                    <span className="star-score">{star>0?star:''}</span>
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="어떤 점이 좋았나요? 15자 이상 작성해주세요."
                    minLength={15}
                    value={reviewText}
                    onChange={e=>setReviewText(e.target.value)}
                    required
                />
                <div className="review-file-input">
                    <label htmlFor="center-review-upload" className="file-label">
                    <FaCamera /> 사진첨부 (최대 5장)
                    <input
                        id="center-review-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    </label>
                    <div className="review-file-preview">
                    {files.map((file, i) => (
                        <span key={i} className="file-name">{file.name}</span>
                    ))}
                    </div>
                </div>
                <button type="submit" className="review-submit-btn" onClick={insertReview}>등록하기</button>
                </form>
            </div>
            {/* 리뷰 리스트 */}
            <div className="center-reviews">
                <h4>리뷰</h4>
                <ul>
                {reviews.list?.map(r=>(
                    <li key={r.review_idx}>
                    <span className="review-user">{r.user_id}</span>
                    <span className="review-rating"><FaStar /> {r.rating}</span>
                    <span className="review-content">{r.content}</span>
                    {r.images && r.images?.length>0 && (
                        <span className="review-images">
                        {r.images.map((img,idx)=>(
                            <img key={idx} src={img} alt="첨부" style={{width:40,height:40,objectFit:'cover',borderRadius:'0.4rem',marginLeft:4}} />
                        ))}
                        </span>
                    )}
                    <span className="review-date">{r.date}</span>
                    </li>
                ))}
                </ul>
            </div>
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default CenterDetail;
