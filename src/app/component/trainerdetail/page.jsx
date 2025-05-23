'use client'

import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaTag, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import KakaoMap from '../map/kakaomap';

const trainerSample = {
  user_id: 'trainer1',
  user_name: '김트레이너',
  profile_image: '/trainer1.jpg',
  center_idx: 1,
  center_name: '헬스월드 강남점',
  center_address: '서울 강남구 역삼동 123-45',
  center_contact: '02-1234-5678',
  exercise_type: 'PT',
  tags: ['유경험자', '체계적인', '친절한'],
  intro: '10년 경력의 퍼스널 트레이너. 맞춤형 프로그램 진행.',
  rating: 4.8,
  reviews: [
    { review_id: 1, user_name: '회원A', rating: 5, content: '트레이닝이 정말 체계적이에요!', date: '2025-05-01', images: [] },
    { review_id: 2, user_name: '회원B', rating: 4.5, content: '운동법을 꼼꼼히 알려주셔서 좋아요.', date: '2025-05-02', images: [] }
  ]
};

const TrainerDetail = () => {
  const [reviewText, setReviewText] = useState('');
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [files, setFiles] = useState([]);
  const [reviews, setReviews] = useState(trainerSample.reviews);

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
        user_name: '나(로그인회원)', // 실제론 로그인 회원명
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

  return (
    <div>
        <Header/>
        <div className='wrap padding_120_0'>
            <div className="trainer-detail-container">
            <div className="trainer-header">
                <img src={trainerSample.profile_image} alt={trainerSample.user_name} className="trainer-main-image" />
                <div className="trainer-header-info">
                <h2>{trainerSample.user_name}</h2>
                <div className="trainer-type">{trainerSample.exercise_type}</div>
                <div className="trainer-tags">
                    {trainerSample.tags.map(tag => <span key={tag} className="trainer-tag"><FaTag /> {tag}</span>)}
                </div>
                <div className="trainer-rating">
                    <FaStar /> {avgRating} <span style={{fontSize:'0.92rem',color:'#888'}}>({reviews.length}명)</span>
                </div>
                </div>
            </div>
            <div className="trainer-intro">
                <h4>트레이너 소개</h4>
                <p>{trainerSample.intro}</p>
                <Link href={'/component/reservation'}>
                    <div className="review-submit-btn width_fit">예약 하기</div>
                </Link>
            </div>
            <div className="trainer-center-info">
                <h4>소속 센터</h4>
                <div className="center-brief">
                <span className="center-name">{trainerSample.center_name}</span>
                <span className="center-address"><FaMapMarkerAlt /> {trainerSample.center_address}</span>
                <span className="center-contact"><FaPhoneAlt /> {trainerSample.center_contact}</span>
                </div>
            </div>
            <div>
                <KakaoMap Lat={37.570656845556} Lng={126.9930055114}/>
            </div>
            {/* 리뷰 작성 인풋 */}
            <div className="trainer-review-write">
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
                    placeholder="트레이너에 대한 솔직한 후기를 남겨주세요. (15자 이상)"
                    minLength={15}
                    value={reviewText}
                    onChange={e=>setReviewText(e.target.value)}
                    required
                />
                <div className="review-file-input">
                    <label htmlFor="trainer-review-upload" className="file-label">
                    <FaCamera /> 사진첨부 (최대 5장)
                    <input
                        id="trainer-review-upload"
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
                <button type="submit" className="review-submit-btn">등록하기</button>
                </form>
            </div>
            {/* 리뷰 리스트 */}
            <div className="trainer-reviews">
                <h4>리뷰</h4>
                <ul>
                {reviews.map(r=>(
                    <li key={r.review_id}>
                    <span className="review-user">{r.user_name}</span>
                    <span className="review-rating"><FaStar /> {r.rating}</span>
                    <span className="review-content">{r.content}</span>
                    {r.images && r.images.length>0 && (
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

export default TrainerDetail;
