'use client'

import React, {useEffect, useState} from 'react';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaTag, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import KakaoMap from '../map/kakaomap';
import {useRouter, useSearchParams} from "next/navigation";
import axios from "axios";

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
  const [reviews, setReviews] = useState({});
  const [trainerInfo, setTrainerInfo] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const router = useRouter();

  const searchParams = useSearchParams();
  const trainer_id = searchParams.get('trainer_id');

  const getTrainerInfo = async() =>{
      const {data} = await axios.post('http://localhost/detail/profile',{"trainer_id":trainer_id,"user_level":'2'});
      console.log(data);
      setTrainerInfo(data);
  }

  useEffect(() => {
      getTrainerInfo();
      fetchReviews();
  }, []);

  const  handleToggleMap = () =>{
      setShowMap(!showMap);
  }

  const handleMoveReservation =()=>{
      router.push(`/component/reservation?trainer_id=${trainer_id}&trainer_idx=${trainerInfo.trainer_idx}&center_id=${trainerInfo.center_id}&center_idx=${trainerInfo.center_idx}`);
    }


    // 리뷰 목록 가져오기

    const fetchReviews = async () => {
        const {data} = await axios.post(
            `http://localhost/list/review/0`
        );

        console.log(data);
        const allReviews = data.list || [];
        const relatedReviews = allReviews.filter(
            (review) => String(review.target_id) === trainer_id
        );
        setReviews({data, list: relatedReviews});
        console.log(relatedReviews.length);
        setTotalPage(relatedReviews.length / 10) ;
        console.log('필터링된 리뷰:', relatedReviews);
    };

    const filteredList = reviews.list
        ?.length
        ? reviews.list
        : [];

    const reviewsPerPage = 10;
    const startIndex = (page - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const paginatedReviews = filteredList
        ?.slice(startIndex, endIndex);

  // 별점 평균/참여인원
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(2) : '-';

  return (
    <div>
        <Header/>
        <div className='wrap padding_120_0'>
            <div className="trainer-detail-container">
                <div>
                    <h2 style={{fontSize: "3.5rem",
                        fontWeight: 'bold',
                        color:'#3673c1'}}>{trainerInfo.name}</h2>
                    <div className="review-submit-btn width_fit" style={{fontSize:'1.5rem'}} onClick={handleMoveReservation}>예약 하기</div>
                    <div className="trainer-header">
                        <img src={`http://localhost/profileImg/profile/${trainer_id}`} alt={trainerInfo.name} className="trainer-main-image" />
                        <div className="trainer-header-info">

                            <div className="trainer-tags">
                                {/*{trainerInfo.tags?.map(tag => <span key={tag} className="trainer-tag"  style={{fontSize:'1.5rem'}}><FaTag />{tag}</span>)}*/}
                                {trainerInfo.tags?.map(tag => <span key={tag} className="trainer-tag"  style={{fontSize:'1.5rem'}}>{tag}</span>)}
                            </div>
                            <div className="trainer-type"  style={{fontSize:'1.5rem'}}>{trainerInfo.exercise}</div>
                            <div className="trainer-rating" style={{fontSize:'1.3rem'}}>
                                <FaStar /> {avgRating} <span style={{fontSize:'1.3rem',color:'#888'}}>({reviews.length}명)</span>
                            </div>
                        </div>

                    </div>
                    <div className="trainer-intro">
                        <h4 style={{fontSize:'1.9rem',marginBottom:'10px', fontWeight:"bold"}}>트레이너 소개</h4>
                        <p style={{fontSize:'1.5rem'}}>{trainerInfo.career}</p>

                    </div>
                    <div className="trainer-center-info">
                        <h4 style={{fontSize:'1.9rem',marginBottom:'10px', fontWeight:"bold"}}>소속 센터</h4>
                        <div className="center-brief">
                            <span className="center-name">{trainerInfo.center_name}</span>
                            <span className="center-address" style={{fontSize:'1.4rem'}}><FaMapMarkerAlt /> {trainerInfo.center_address}</span>
                            <span className="center-contact" style={{fontSize:'1.3rem'}}><FaPhoneAlt /> {trainerInfo.center_phone}</span>
                        </div>
                    </div>
                    <div>
                        <button
                            className='cancel-button'
                            onClick={handleToggleMap}
                            style={{
                                marginBottom: '1rem'

                            }}>
                            {
                                showMap
                                    ? '지도 닫기'
                                    : '위치 보기'
                            }
                        </button>
                        {
                            showMap && (
                                <div>
                                    <KakaoMap address={trainerInfo.center_address}/>
                                </div>
                            )
                        }
                    </div>
                </div>
            {/* 리뷰 작성 인풋 */}
            {/*<div className="trainer-review-write">*/}
            {/*    <h4>리뷰 작성</h4>*/}
            {/*    <form onSubmit={handleReviewSubmit}>*/}
            {/*    <div className="star-input">*/}
            {/*        {[1,2,3,4,5].map(i=>(*/}
            {/*        <span key={i} style={{position:'relative',display:'inline-block'}}>*/}
            {/*            <FaStar*/}
            {/*            className="star"*/}
            {/*            color={((hoverStar||star) >= i) ? '#FFC107' : '#e4e5e9'}*/}
            {/*            onMouseEnter={()=>handleStarHover(i)}*/}
            {/*            onMouseLeave={handleStarOut}*/}
            {/*            onClick={()=>handleStarClick(i)}*/}
            {/*            style={{cursor:'pointer',fontSize:'2rem'}}*/}
            {/*            />*/}
            {/*            /!* 0.5점 지원 *!/*/}
            {/*            <FaStar*/}
            {/*            className="star half"*/}
            {/*            color={((hoverStar||star) >= i-0.5) && ((hoverStar||star)<i) ? '#FFC107':'transparent'}*/}
            {/*            style={{*/}
            {/*                cursor:'pointer',*/}
            {/*                fontSize:'2rem',*/}
            {/*                position:'absolute',*/}
            {/*                left:0,*/}
            {/*                zIndex:1,*/}
            {/*                clipPath:'inset(0 50% 0 0)'*/}
            {/*            }}*/}
            {/*            onMouseEnter={()=>handleStarHover(i-0.5)}*/}
            {/*            onMouseLeave={handleStarOut}*/}
            {/*            onClick={()=>handleStarClick(i-0.5)}*/}
            {/*            />*/}
            {/*        </span>*/}
            {/*        ))}*/}
            {/*        <span className="star-score">{star>0?star:''}</span>*/}
            {/*    </div>*/}
            {/*    <textarea*/}
            {/*        className="review-textarea"*/}
            {/*        placeholder="트레이너에 대한 솔직한 후기를 남겨주세요. (15자 이상)"*/}
            {/*        minLength={15}*/}
            {/*        value={reviewText}*/}
            {/*        onChange={e=>setReviewText(e.target.value)}*/}
            {/*        required*/}
            {/*    />*/}
            {/*    <div className="review-file-input">*/}
            {/*        <label htmlFor="trainer-review-upload" className="file-label">*/}
            {/*        <FaCamera /> 사진첨부 (최대 5장)*/}
            {/*        <input*/}
            {/*            id="trainer-review-upload"*/}
            {/*            type="file"*/}
            {/*            accept="image/jpeg,image/png"*/}
            {/*            multiple*/}
            {/*            onChange={handleFileChange}*/}
            {/*            style={{ display: 'none' }}*/}
            {/*        />*/}
            {/*        </label>*/}
            {/*        <div className="review-file-preview">*/}
            {/*        {files.map((file, i) => (*/}
            {/*            <span key={i} className="file-name">{file.name}</span>*/}
            {/*        ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <button type="submit" className="review-submit-btn">등록하기</button>*/}
            {/*    </form>*/}
            {/*</div>*/}
            {/* 리뷰 리스트 */}
                <div className='wrap padding_120_0'>

                    <div className="trainer-reviews">
                        <h4>리뷰</h4>
                        <ul>
                            {
                                paginatedReviews?.map(r => (
                                    <li key={r.review_idx} className="review-item" style={{flexDirection:'column'}}>
                                        {/* 첫 줄: 작성자 + 별점 + 날짜 */}
                                        <div className="review-meta" style={{textAlign:'left', paddingLeft:'20px', paddingTop:'inherit'}}>
                                            <span className="review-user">{r.user_id}</span>
                                            <span className="review-rating"><FaStar/> {r.rating}</span>
                                            <span className="review-date">{r.date}</span>
                                        </div>

                                        {/* 둘째 줄: 내용 */}
                                        <div className="review-body" style={{textAlign:'left'}}>
                                            <span className="review-content" style={{paddingLeft:'30px'}}>{r.content}</span>

                                            {/* 이미지 */}
                                            {
                                                r.file_idx && r.file_idx.length > 0 && (
                                                    <div className="review-images" style={{textAlign:'left', paddingLeft:'27px'}}>
                                                        {
                                                            JSON.parse(r.file_idx).map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={`http://localhost/reviewImg/${img}`}
                                                                    alt="첨부"
                                                                    style={{
                                                                        width: 132,
                                                                        height: 132,
                                                                        objectFit: 'cover',
                                                                        borderRadius: '1.4rem',
                                                                        marginLeft: 4
                                                                    }}
                                                                />
                                                            ))
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="pagination-buttons-fixed">
                        {
                            page > 1 && (
                                <div>
                                    <button
                                        type="button"
                                        className="review-submit-btn-n"
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                                        이전 페이지
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    <div style={{ justifyContent: 'flex-end' ,display:'flex'}}>
                        {
                            reviews.list && reviews.list.length > 9 && page <= totalPage && (
                                <button
                                    className="review-submit-btn-n"
                                    onClick={() => setPage(prev => prev + 1)}

                                > 다음 페이지
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default TrainerDetail;
