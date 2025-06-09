'use client'

import React, {useEffect, useState} from 'react';
import Header from './Header';
import Footer from './Footer';
import {Splide, SplideSlide} from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import KakaoMap from './component/map/kakaomap';
import {FaStar} from 'react-icons/fa';
import axios from 'axios';
import {useRouter} from 'next/navigation';

const BOARD_CATEGORIES = ['공지사항', '이벤트', 'QnA'];

const CATEGORY_PATH = {
    '공지사항': '/component/board',
    '이벤트': '/component/board/event',
    'QnA': '/component/board/qna'
};

const MainPage = () => {
    const [centerList, setCenterList] = useState([]);
    const [trainerList, setTrainerList] = useState([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [boardList, setBoardList] = useState([]);
    const [isAuthed, setIsAuthed] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const user_id = sessionStorage.getItem('user_id');
        const token = sessionStorage.getItem('token');
        setIsAuthed(!!user_id && !!token);
    }, []);

    const center_list = async () => {
        let {data} = await axios.post('http://localhost/center_rating/list');
        if (data && data.list) 
            setCenterList(data.list);
        };
    const trainer_list = async () => {
        let {data} = await axios.post('http://localhost/trainer_rating/list');
        if (data && data.list) 
            setTrainerList(data.list);
        };
    const handleMoveCenter = (id) => {
        router.push(`/component/centerdetail?center_id=${id}`);
    };

    const handleMoveTrainer = (id) => {
        router.push(`/component/trainerdetail?trainer_id=${id}`);
    };

    const getMyList = async () => {
        let all = [];
        for (let category of BOARD_CATEGORIES) {
            const {data} = await axios.post('http://localhost/list/bbs', {
                category,
                page: 1,
            });
            console.log(data);
            if (data && data.list) {
                all = all.concat(data.list.map(item => ({
                    ...item,
                    category
                })));
            }
        }
        setBoardList(all);
    };

    useEffect(() => {
        center_list();
        trainer_list();
        getMyList();
    }, []);

    // 카테고리별 최신순 5개만 추출
    const getBoardByCategory = (category) => {
        return boardList
            .filter(item => item.category === category)
            .sort((a, b) => new Date(b.reg_date) - new Date(a.reg_date))
            .slice(0, 5);
    };

    // 게시글 상세 이동
    const MoveBoardDetail = (category, board_idx) => {
        router.push(
            `/component/board/boarddetail?category=${category}&board_idx=${board_idx}`
        );
    };

    // 카테고리별 전체 게시판 이동
    const MoveBoardList = (category) => {
        router.push(CATEGORY_PATH[category]);
    };

    // 메인 슬라이드 데이터
    const slides = [
        {
            bg: "url('/slide_1.jpg')",
            title: "원하는 시간에 간편하게 헬스장 예약!",
            text: "한 번의 클릭으로 가까운 헬스장부터 인기 PT까지, 원하는 시간에 쉽고 빠르게 예약하세요."
        }, {
            bg: "url('/slide_2.jpg')",
            title: "실제 이용자 리뷰로 믿고 선택하세요!",
            text: "수천 개의 생생한 리뷰와 평점으로 나에게 꼭 맞는 헬스장을 찾아보세요."
        }, {
            bg: "url('/slide_3.jpg')",
            title: "다양한 혜택과 이벤트, 지금 바로 참여!",
            text: "회원 전용 할인, 무료 체험 등 다양한 이벤트로 건강한 시작을 응원합니다!"
        }
    ];

    return (
        <div>
            <Header/> {/* 메인슬라이드, 헬스장 영역 (흰 배경) */}
            <div>
                {/* 첫번째 모듈 메인슬라이드 영역 */}
                <div className='slide_wrap'>
                    <Splide aria-label="Splide Basic Example" options={{
                            type: 'fade',
                            perPage: 1,
                            autoplay: true
                        }} onMoved={(_, newIndex) => setActiveSlide(newIndex)}
                        // 슬라이드 이동시 인덱스 변경
                    >
                        {
                            slides.map((slide, idx) => (
                                <SplideSlide key={idx}>
                                    <div
                                        className="slide_img flex column align_center justify_con_center"
                                        style={{
                                            background: slide.bg,
                                            height: "900px"
                                        }}>
                                        <div
                                            className={`slideText flex column gap_20${activeSlide === idx
                                                ? " active"
                                                : ""}`}>
                                            <p className="white_color title">{slide.title}</p>
                                            <p className="white_color content_text">{slide.text}</p>
                                        </div>
                                    </div>
                                </SplideSlide>
                            ))
                        }
                    </Splide>
                </div>

                {/* 두번째 모듈 인기있는 헬스장 영역 */}
                <div className='padding_120_0 wrap center_list'>
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
                            focus: 'center', 
                            autoplay: true,
                            gap: "10px",
                            pagination: false,
                            padding: {
                                left: '5rem',
                                right: '5rem',
                                top: '5rem',
                                bottom: '5rem'
                            }
                        }}
                        >
                        {
                            centerList.map((center, idx) => (
                                <SplideSlide key={center.center_id || idx}>
                                    <div
                                        className='flex column'
                                        style={{
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleMoveCenter(center.center_id)}>
                                        <div
                                            style={{
                                                background:`url('http://localhost/profileImg/profile/${center.center_id}') center center/cover no-repeat`,
                                                width:'100%',
                                                aspectRatio:'1/1'
                                            }}/>
                                        <div className='flex column gap_10 mt_20'>
                                            <p
                                                className='content_text'
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 20
                                                }}>
                                                {center.center_name}
                                            </p>
                                            {
                                                center.introduction == '' || center.introduction == null
                                                    ? ''
                                                    : <p
                                                            className='label'
                                                            style={{
                                                                color: '#888'
                                                            }}>
                                                            {center.introduction}
                                                        </p>
                                            }
                                            <div className="flex align_center gap_8 justify_con_center">
                                                <span
                                                    style={{
                                                        color: "#FFC107",
                                                        fontSize: 22,
                                                        marginRight: 4
                                                    }}>
                                                    <FaStar/>
                                                </span>
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 18
                                                    }}>
                                                    {
                                                        center.avg_rating
                                                            ? Number(center.avg_rating).toFixed(1)
                                                            : "0.0"
                                                    }
                                                </span>
                                                <span
                                                    style={{
                                                        color: "#888",
                                                        marginLeft: 6,
                                                        fontSize: 15
                                                    }}>
                                                    ({center.rating_count || 0})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SplideSlide>
                            ))
                        }
                    </Splide>
                </div>
            </div>

            {/* 트레이너 영역 */}
            <div className='bg_primary_color_2 trainer_list'>
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
                                focus: 'center', 
                                padding: {
                                    left: '5rem',
                                    right: '5rem',
                                },
                                pagination: false
                            }}>
                            {
                                trainerList.map((trainer, idx) => (
                                    <SplideSlide key={trainer.trainer_id || idx}>
                                        <div
                                            className='flex column'
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleMoveTrainer(trainer.trainer_id)}>
                                            <div
                                                style={{
                                                    background:`url('http://localhost/profileImg/profile/${trainer.trainer_id}') center center/cover no-repeat`,
                                                    width:'100%',
                                                    aspectRatio:'1/1'
                                                }}/>
                                            <div className='flex column gap_10 mt_20'>
                                                <p
                                                    className='content_text'
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 20
                                                    }}>
                                                    {trainer.name}
                                                </p>
                                                <div className="flex align_center gap_8 justify_con_center">
                                                    <span
                                                        style={{
                                                            color: "#FFC107",
                                                            fontSize: 22,
                                                            marginRight: 4
                                                        }}>
                                                        <FaStar/>
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 18
                                                        }}>
                                                        {
                                                            trainer.avg_rating
                                                                ? Number(trainer.avg_rating).toFixed(1)
                                                                : "0.0"
                                                        }
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: "#888",
                                                            marginLeft: 6,
                                                            fontSize: 15
                                                        }}>
                                                        ({trainer.rating_count || 0})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </SplideSlide>
                                ))
                            }
                        </Splide>
                    </div>
                </div>
            </div>

            {/* 게시판, 카카오맵 등 흰 배경 */}
             <div className='wrap' style={{ position: 'relative' }}>
                <div className='padding_120_0'>
                    <div className='mb_40 flex column gap_10'>
                        <p className='title'>내부 위치</p>
                        <p className='content_text'>게시판 및 위치 확인해주세요.</p>
                    </div>
                    <div>
                        <KakaoMap/>
                    </div>
                    <div className='flex gap_20 board-area' style={{ position: 'relative' }}>
                        {/* 게시판 카드들 */}
                        {BOARD_CATEGORIES.map((category) => (
                            <div className='board-card position_rel' key={category}>
                                <p className='board-title'>{category}</p>
                                <div className='board-header flex gap_20'>
                                    <span>제목</span>
                                    <span className='ml_auto'>날짜</span>
                                </div>
                                {getBoardByCategory(category).length === 0
                                    ? (
                                        <div className='board-row flex gap_20'>
                                            <span>게시글이 없습니다.</span>
                                        </div>
                                    )
                                    : (getBoardByCategory(category).map((item) => (
                                        <div
                                            className='board-row flex gap_20'
                                            key={item.board_idx}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => MoveBoardDetail(category, item.board_idx)}>
                                            <span>{item.title}</span>
                                            <span className='ml_auto'>
                                                {item.reg_date ? item.reg_date.slice(0, 10) : ''}
                                            </span>
                                        </div>
                                    )))
                                }
                                <a
                                    className='board-more'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => MoveBoardList(category)}>
                                    더보기
                                </a>
                            </div>
                        ))}
                        {/* --- 암막 오버레이 --- */}
                        {!isAuthed && (
                            <div
                                className="board-overlay"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(0,0,0,0.55)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    transition: 'background 0.3s',
                                    borderRadius: '12px'
                                }}
                            >
                                <button
                                    onClick={() => router.replace('/component/login')}
                                    className="btn label white_color"
                                >
                                    로그인
                                </button>
                            </div>
                        )}
                        {/* --- 암막 오버레이 끝 --- */}
                    </div>
                </div>
            </div>

            <Footer/>
        </div>
    );
};

export default MainPage;
