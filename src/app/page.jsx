'use client'

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import KakaoMap from './component/map/kakaomap';
import AlertModal from './component/alertmodal/page';
import { FaStar } from 'react-icons/fa';


const MainPage = () => {

    const [hoverStar, setHoverStar] = useState(0);
      const [star, setStar] = useState(0);
  // 별점 클릭/호버
  const handleStarClick = (value) => setStar(value);
  const handleStarHover = (value) => setHoverStar(value);
  const handleStarOut = () => setHoverStar(0);

    return (
        <div>
            <Header/>

            {/* 메인슬라이드, 헬스장 영역 (흰 배경) */}
            <div>
                {/* 첫번째 모듈 메인슬라이드 영역 */}
                <div className='slide_wrap'>
                    <Splide
                        aria-label="Splide Basic Example"
                        options={{
                            type: 'loop',
                            perPage: 1,
                            autoplay: true
                        }}>
                        <SplideSlide>
                            <div className='slide_img' style={{ background: "url('/slide_1.jpg')", height: "900px" }}>
                            </div>
                        </SplideSlide>
                        <SplideSlide>
                            <div className='slide_img' style={{ background: "url('/slide_2.jpg')", height: "900px" }}>
                            </div>
                        </SplideSlide>
                        <SplideSlide>
                            <div className='slide_img' style={{ background: "url('/slide_3.jpg')", height: "900px" }}>
                            </div>
                        </SplideSlide>
                    </Splide>
                </div>
                {/* 두번째 모듈 인기있는 헬스장 영역 */}
                <div className='padding_120_0 wrap'>
                    <div className='mb_40 flex column gap_10'>
                        <p className='title'>헬스장 리스트</p>
                        <p className='middle_title'>가장 인기있는 헬스장 리스트를 확인해보세요!</p>
                        <p className='content_text'>별점을 통해 가장 인기있는 리스트들을 모아두었습니다.</p>
                    </div>
                    <Splide
                        aria-label="Splide Basic Example"
                        options={{
                            type: 'loop',
                            perPage: 3,
                            autoplay: true,
                            gap: "10px",
                            padding: {
                                left: '5rem',
                                right: '5rem'
                            }
                        }}>
                        <SplideSlide>
                            <div>
                                <div style={{ background: "#ccc", height: '200px' }}>
                                    <p>이미지 영역</p>
                                </div>
                                <div className='flex column gap_10 mt_20'>
                                    <p className='content_text'>제목 영역</p>
                                    <p className='label'>내용 영역</p>
                                    <p>      
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
                                    </p>
                                </div>
                            </div>
                        </SplideSlide>
                    </Splide>
                </div>
            </div>

            {/* === 트레이너 영역만 배경색 전체 === */}
            <div className='bg_primary_color_2'>
                <div className='padding_120_0'>
                    <div className='wrap'>
                        <div className='mb_40 flex column gap_10'>
                            <p className='title'>트레이너 리스트</p>
                            <p className='middle_title'>가장 인기있는 트레이너 리스트를 확인해보세요!</p>
                            <p className='content_text'>별점을 통해 가장 인기있는 리스트들을 모아두었습니다.</p>
                        </div>
                        <Splide
                            aria-label="Splide Basic Example"
                            options={{
                                type: 'loop',
                                perPage: 3,
                                autoplay: true,
                                gap: "10px",
                                padding: {
                                    left: '5rem',
                                    right: '5rem'
                                }
                            }}>
                            <SplideSlide>
                                <div>
                                    <div style={{ background: "#ccc", height: '200px' }}>
                                        <p>이미지 영역</p>
                                    </div>
                                    <div className='flex column gap_10 mt_20'>
                                        <p className='content_text'>제목 영역</p>
                                        <p className='label'>내용 영역</p>
                                        <p>
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
                                        </p>
                                    </div>
                                </div>
                            </SplideSlide>
                        </Splide>
                    </div>
                </div>
            </div>
            {/* === 여기까지 === */}

            {/* 게시판, 카카오맵 등 흰 배경 */}
            <div className='wrap'>
                <div className='padding_120_0'>
                    <div className='mb_40 flex column gap_10'>
                        <p className='title'>내부 위치</p>
                        <p className='content_text'>게시판 및 위치 확인해주세요.</p>
                    </div>
                    <div>
                        <KakaoMap Lat={37.570656845556} Lng={126.9930055114}/>
                    </div>
                    <div className='flex gap_10'>
                        <div className='content_text position_rel' style={{border:'1px solid #ccc', padding : 20}}>
                            <p>공지사항</p>
                            <div className='flex gap_20'>
                                <p>제목</p>
                                <p className='ml_auto'>날짜</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <p style={{position:'absolute', right:15, top:15}}>더보기</p>
                        </div>
                        <div className='content_text position_rel' style={{border:'1px solid #ccc', padding : 20}}>
                            <p>이벤트</p>
                            <div className='flex gap_20'>
                                <p>제목</p>
                                <p className='ml_auto'>날짜</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <p style={{position:'absolute', right:15, top:15}}>더보기</p>
                        </div>
                        <div className='content_text position_rel' style={{border:'1px solid #ccc', padding : 20}}>
                            <p>QnA</p>
                            <div className='flex gap_20'>
                                <p>제목</p>
                                <p className='ml_auto'>날짜</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <div className='flex gap_20'>
                                <p>제목입니다.</p>
                                <p className='ml_auto'>2025-05-14</p>
                            </div>
                            <p style={{position:'absolute', right:15, top:15}}>더보기</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default MainPage;
