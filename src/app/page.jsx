'use client'

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import KakaoMap from './component/map/kakaomap';
import AlertModal from './component/alertmodal/page';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';


const MainPage = () => {

    const [hoverStar, setHoverStar] = useState(0);
    const [star, setStar] = useState(0);
    // 별점 클릭/호버
    const handleStarClick = (value) => setStar(value);
    const handleStarHover = (value) => setHoverStar(value);
    const handleStarOut = () => setHoverStar(0);

    const [centerList, setCenterList] = useState([]);
    const [trainerList, setTrainerList] = useState([]);

    const center_list = async () => {
        let { data } = await axios.post('http://localhost/center_rating/list');
        if (data && data.list) setCenterList(data.list);
    };
    const trainer_list = async () => {
        let { data } = await axios.post('http://localhost/trainer_rating/list');
        if (data && data.list) setTrainerList(data.list);
    };

    useEffect(() => { center_list(); trainer_list();}, []);

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
                        <p className='title'>센터 리스트</p>
                        <p className='middle_title'>가장 인기있는 센터 리스트를 확인해보세요!</p>
                        <p className='content_text'>별점을 통해 가장 인기있는 리스트들을 모아두었습니다.</p>
                    </div>
                        <Splide
                        aria-label="센터 리스트"
                        options={{
                            type: 'loop',
                            perPage: 5,
                            autoplay: true,
                            gap: "10px",
                            pagination : false,
                            padding: { left: '5rem', right: '5rem' }
                        }}>
                        {/* 추후 링크걸기 */}
                        {centerList.map((center, idx) => (
                            <SplideSlide key={center.center_id || idx}>
                                <div className='flex column'>
                                    {/* 대표 이미지 */}
                                    <div
                                        style={{
                                            background: center.profile_image
                                                ? `url('http://localhost/center_profile/${center.profile_image}') center/cover no-repeat`
                                                : "#ccc",
                                            aspectRatio:'1/1',
                                            borderRadius: 12
                                        }}
                                    />
                                    <div className='flex column gap_10 mt_20'>
                                        <p className='content_text' style={{ fontWeight: 600, fontSize: 20 }}>
                                            {center.center_name}
                                        </p>
                                        {center.introduction == '' || center.introduction == null ? '' : 
                                        <p className='label' style={{ color: '#888'}}>
                                            {center.introduction}
                                        </p>}
                                        {/* 별점 + 참여인원수 */}
                                        <div className="flex align_center gap_8 justify_con_center">
                                            {/* 별점(소수점) 표시 */}
                                            <span style={{ color: "#FFC107", fontSize: 22, marginRight: 4 }}>
                                                <FaStar />
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 18 }}>
                                                {center.avg_rating ? Number(center.avg_rating).toFixed(1) : "0.0"}
                                            </span>
                                            <span style={{ color: "#888", marginLeft: 6, fontSize: 15 }}>
                                                ({center.rating_count || 0})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SplideSlide>
                        ))}
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
                                perPage: 5,
                                autoplay: true,
                                gap: "10px",
                                padding: {
                                    left: '5rem',
                                    right: '5rem'
                                },
                                pagination : false,
                            }}>
                                {trainerList.map((trainer, idx) => (
                                <SplideSlide key={trainer.trainer_id || idx}>
                                    <div className='flex column'>
                                        {/* 대표 이미지 */}
                                        <div
                                            style={{
                                                background: trainer.profile_image
                                                    ? `url('http://localhost/center_profile/${trainer.profile_image}') center/cover no-repeat`
                                                    : "#ccc",
                                                aspectRatio:'1/1',
                                                borderRadius: 12
                                            }}
                                        />
                                        <div className='flex column gap_10 mt_20'>
                                            <p className='content_text' style={{ fontWeight: 600, fontSize: 20 }}>
                                                {trainer.trainer_name}
                                            </p>
                                            {/* 별점 + 참여인원수 */}
                                            <div className="flex align_center gap_8 justify_con_center">
                                                {/* 별점(소수점) 표시 */}
                                                <span style={{ color: "#FFC107", fontSize: 22, marginRight: 4 }}>
                                                    <FaStar />
                                                </span>
                                                <span style={{ fontWeight: 600, fontSize: 18 }}>
                                                    {trainer.avg_rating ? Number(trainer.avg_rating).toFixed(1) : "0.0"}
                                                </span>
                                                <span style={{ color: "#888", marginLeft: 6, fontSize: 15 }}>
                                                    ({trainer.rating_count || 0})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SplideSlide>
                            ))}
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
                        <KakaoMap/>
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
