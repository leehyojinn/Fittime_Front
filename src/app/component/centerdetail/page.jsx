'use client'

import React, {useEffect, useState} from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaStar, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import KakaoMap from '../map/kakaomap';
import axios from 'axios';
import {useRouter, useSearchParams} from "next/navigation";

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
  const [reviews, setReviews] = useState({});
  const [centerInfo, setCenterInfo] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);


  const searchParams = useSearchParams();
  const center_id = searchParams.get('center_id');

  const router = useRouter();

  const handleMoveReservation =()=>{
      router.push(`/component/reservation?center_id=${centerInfo.center_id}&center_idx=${centerInfo.center_idx}`);
  }

  const handleMoveComplaint = (r) => {
      router.push(`/component/complaint?review_idx=${r.review_idx}&target_id=${r.user_id}&report_id=${sessionStorage.getItem('user_id')}`);
  }

  const getCenterInfo = async() =>{
      const {data} = await axios.post('http://localhost/detail/profile',{"center_id":center_id,"user_level":'3'});
      console.log(data);
      setCenterInfo(data);
  }

    useEffect(() => {
        getCenterInfo();
        fetchReviews();
    }, []);

  const  handleToggleMap = () =>{
    setShowMap(!showMap);
  }

    useEffect(() => {
        console.log('center info : ',centerInfo.address);
    }, [centerInfo]);

    // 리뷰 목록 가져오기

    const fetchReviews = async () => {
        const {data} = await axios.post(
            `http://localhost/list/review/0`
        );

        console.log(data);
        const allReviews = data.list || [];
        const relatedReviews = allReviews.filter(
            (review) => String(review.target_id) === center_id
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
            <div className="center-detail-container">
                <div>
                    <h2 style={{fontSize: "3.5rem",
                        fontWeight: 'bold',
                        color:'#3673c1'}}>{centerInfo.center_name}</h2>
                        <div className="review-submit-btn width_fit" style={{fontSize:'1.5rem'}} onClick={handleMoveReservation}>예약 하기</div>
                    <div className="center-header">
                        <img
                            src={`http://localhost/profileImg/profile/${center_id}`}
                            alt={centerInfo.center_name}
                            className="center-main-image"/>
                        <div className="center-header-info">

                            <div className="center-tags ">
                                { centerInfo.tags && (
                                    centerInfo.tags
                                        .map(tag => <span key={tag} className="center-tag" style={{fontSize:'1.5rem'}}>{tag}</span>))
                                }
                            </div>
                            <div className="center-rating" style={{marginBottom:'10px'}}>
                                <FaStar/> {avgRating}
                                <span
                                    style={{
                                        fontSize: '1.3rem',
                                        color: '#888'
                                    }}>({reviews.length}명)</span>
                            </div>
                            <div className="center-contact" style={{fontSize:'1.3rem'}}>
                                <FaMapMarkerAlt/> {centerInfo.address}
                                <span className="center-contact-phone" ><FaPhoneAlt/> {centerInfo.phone}</span>
                            </div>
                        </div>

                    </div>

                    <div className="center-intro">
                        <h4 style={{fontSize:'1.9rem',marginBottom:'10px', fontWeight:"bold"}}>센터 소개</h4>
                        <p style={{fontSize:'1.45rem',marginBottom:'10px',color:'gray'}}>운영시간 : {centerInfo.operation_hours}</p>
                        <p style={{fontSize:'1.5rem'}}>{centerInfo.introduction}</p>

                    </div>
                    <div>
                        {/* 지도 */}
                        {/* submit-button / cancel-button */}
                        <div>
                            <button
                                className='cancel-button'
                                onClick={handleToggleMap}
                                style={{
                                    marginBottom: '1rem',
                                    fontSize:'1.3rem'
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
                                        <KakaoMap address={centerInfo.center_address}/>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            {/* 리뷰 작성 인풋 */}
            {/*<div className="center-review-write">*/}
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
            {/*        placeholder="어떤 점이 좋았나요? 15자 이상 작성해주세요."*/}
            {/*        minLength={15}*/}
            {/*        value={reviewText}*/}
            {/*        onChange={e=>setReviewText(e.target.value)}*/}
            {/*        required*/}
            {/*    />*/}
            {/*    <div className="review-file-input">*/}
            {/*        <label htmlFor="center-review-upload" className="file-label">*/}
            {/*        <FaCamera /> 사진첨부 (최대 5장)*/}
            {/*        <input*/}
            {/*            id="center-review-upload"*/}
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
            {/*    <button type="submit" className="review-submit-btn" onClick={insertReview}>등록하기</button>*/}
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
                                        {sessionStorage.user_level >= 3 && <div style={{display:'flex',justifyContent:'flex-end'}}>
                                            <button className='warning-button ' onClick={()=>handleMoveComplaint(r)}>
                                                <span class="material-symbols-outlined">warning</span>
                                                <span className='material-symbols-outlined-text'>신고하기</span>
                                            </button>
                                        </div>}
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

export default CenterDetail;
