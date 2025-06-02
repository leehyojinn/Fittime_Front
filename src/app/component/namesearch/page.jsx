'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaUser, FaBuilding, FaSearch } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from "axios";

const NameSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all'); // 'all', 'trainer', 'center'
    const [searchResults, setSearchResults] = useState({trainers: [], centers: []});
    const [isLoading, setIsLoading] = useState(false);
    const [page,setPage] = useState(1);


    const search=async()=>{
        const {data} = await axios.post('http://localhost/search/name',{name:searchTerm, page:page});
        console.log(data);
        // const results = {
        //     trainers: searchType === 'center'
        //         ? []
        //         : data.trainer_list,
        //     centers: searchType === 'trainer'
        //         ? []
        //         : data.center_list
        // };

        const results = {
            trainers: data.trainer_list ?? [],
            centers: data.center_list ?? []
        };
        console.log(results);

        setSearchResults(results);
        setIsLoading(false);
    }

    // 검색 실행
    const handleSearch = () => {
        if (!searchTerm.trim()) 
            return;
        
        setIsLoading(true);

        // API 호출하여 검색 결과 로드
        setTimeout(async() => {
            const mockTrainers = [
                {
                    user_id: 'trainer1',
                    user_name: '김트레이너',
                    profile_image: '/trainer1.jpg',
                    center_name: '헬스월드 강남점',
                    lowest_price: 100000,
                    exercise_type: 'PT',
                    tags: [
                        '친절한', '체계적인'
                    ],
                    rating: 4.8,
                    rating_count: 24
                }, {
                    user_id: 'trainer2',
                    user_name: '파트레이닝',
                    profile_image: '/trainer2.jpg',
                    center_name: '피트니스클럽',
                    lowest_price: 120000,
                    exercise_type: '필라테스',
                    tags: [
                        '유경험자', '세심한' , '전문적인', '파이팅', '저기요'
                    ],
                    rating: 4.9,
                    rating_count: 18
                }
            ].filter(trainer => trainer.user_name.includes(searchTerm));

            const mockCenters = [
                {
                    center_idx: 1,
                    center_name: '헬스월드 강남점',
                    center_image: '/center1.jpg',
                    lowest_price: 80000,
                    tags: [
                        '24시간', '샤워시설', '피트니스'
                    ],
                    rating: 4.6,
                    rating_count: 48,
                    address: '서울 강남구 역삼동 123-45'
                }, {
                    center_idx: 2,
                    center_name: '파워짐 송파점',
                    center_image: '/center2.jpg',
                    lowest_price: 70000,
                    tags: [
                        '피트니스', '무료 PT'
                    ],
                    rating: 4.8,
                    rating_count: 36,
                    address: '서울 송파구 잠실동 456-78'
                }
            ].filter(center => center.center_name.includes(searchTerm));

            await search();

            // const results = {
            //     trainers: searchType === 'center'
            //         ? []
            //         : mockTrainers,
            //     centers: searchType === 'trainer'
            //         ? []
            //         : mockCenters
            // };
            //
            // setSearchResults(results);
            // setIsLoading(false);
        }, 800); // 검색 지연 시뮬레이션
    };

    // 엔터 키 이벤트 처리
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
    <div>
        <Header/>
        <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
            <p className='title'>이름 검색 (트레이너 , 센터)</p>
        </div>
        <div className='wrap padding_120_0'>

            <div className="name-search-container">
            <h2 className="search-title">이름 검색</h2>
            
            <div className="search-input-container">
                <div className="search-type-selector">
                <button 
                    className={`type-button ${searchType === 'all' ? 'active' : ''}`} 
                    onClick={() => setSearchType('all')}
                >
                    전체
                </button>
                <button 
                    className={`type-button ${searchType === 'trainer' ? 'active' : ''}`} 
                    onClick={() => setSearchType('trainer')}
                >
                    <FaUser /> 트레이너
                </button>
                <button 
                    className={`type-button ${searchType === 'center' ? 'active' : ''}`} 
                    onClick={() => setSearchType('center')}
                >
                    <FaBuilding /> 운동기관
                </button>
                </div>
                
                <div className="search-input-wrapper">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="트레이너 또는 센터 이름 검색"
                />
                <button className="search-button" onClick={handleSearch}>
                    <FaSearch />
                </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="loading-indicator">검색 중...</div>
            ) : (
                <div className="search-results-container">
                {searchResults.trainers.length === 0 && searchResults.centers.length === 0 ? (
                    <div className="no-results">
                    {searchTerm ? '검색 결과가 없습니다. 다른 키워드로 검색해 보세요.' : '트레이너 또는 센터 이름을 검색해 보세요.'}
                    </div>
                ) : (
                    <>
                    {searchType==='trainer' && searchResults.trainers.length > 0 && (
                        <div className="result-section">
                        <h3 className="section-title">
                            <FaUser /> 트레이너 검색 결과
                        </h3>
                        
                        <div className="trainer-results">
                            {searchResults.trainers.map((trainer) => (
                                <div key={trainer.user_id} className="trainer-card">
                                    <div className="center-image" style={{width:"fit-content"}}>
                                        <img
                                            //src={trainer.profile_image || '/default-profile.jpg'}
                                            src={`http://localhost/profileImg/profile/${trainer.trainer_id}`}
                                            alt={trainer.name}
                                            width={200}
                                            height={150}
                                            className="profile-image"
                                        />
                                    </div>

                                    <div className="trainer-info">
                                        <h3 className="center-name">{trainer.name}</h3>

                                        <div className="trainer-center"  style={{fontSize: "1.2rem"}}>
                                            <FaMapMarkerAlt className="location-icon" />
                                            <span>{trainer.center_name}</span>
                                        </div>

                                        {/*<div className="trainer-exercise-type">*/}
                                        {/*<span className="label">전문 분야:</span>*/}
                                        {/*<span className="value">{trainer.exercise_type}</span>*/}
                                        {/*</div>*/}

                                        <div className="trainer-price">
                                            <span className="label">최저 가격:</span>
                                            {trainer.price && <span className="value">{trainer.price.toLocaleString()}원~</span>}
                                        </div>

                                        <div className="trainer-rating">
                                            <FaStar className="star-icon" />
                                            {trainer.review_cnt > 0 &&
                                                <span className="rating">{trainer.rating > 1 ? trainer.rating : trainer.rating.toFixed(1)}</span>}
                                            <span className="rating-count">({trainer.review_cnt})</span>
                                        </div>

                                        {trainer.tags && (
                                            <div className="trainer-tags">
                                                {JSON.parse(trainer.tags).map((tag) => (
                                                    <span key={tag.tag_idx} className="tag"  style={{fontSize:"1.2rem"}}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    )}
                    
                    {searchType==='center' && searchResults.centers.length > 0 && (
                        <div className="result-section">
                        <h3 className="section-title">
                            <FaBuilding /> 운동기관 검색 결과
                        </h3>
                        
                        <div className="center-results">
                            {searchResults.centers.map((center) => (
                                <div key={center.center_idx} className="center-card">
                                    <div className={"center-image"} style={{width:"fit-content"}}>
                                        <img
                                            //src={center.center_image || '/default-center.jpg'}
                                            src={`http://localhost/profileImg/profile/${center.center_id}`}
                                            alt={center.center_name}
                                            className="facility-image"
                                        />
                                    </div>

                                    <div className="center-info">
                                        <h3 className="center-name">{center.center_name}</h3>

                                        <div className="center-address" style={{fontSize:"1.2rem"}}>
                                            <FaMapMarkerAlt className="location-icon" />
                                            <span>{center.address}</span>
                                        </div>

                                        {/*<div className="center-description">*/}
                                        {/*    {center.description}*/}
                                        {/*</div>*/}

                                        <div className="center-price">
                                            <span className="label">최저 가격:</span>
                                            {center.price && <span className="value"> {center.price.toLocaleString()}원~</span>}
                                        </div>

                                        <div className="center-rating">
                                            <FaStar className="star-icon" />
                                            {center.review_cnt > 0 &&
                                                <span className="rating">{center.rating > 1 ? center.rating : center.rating.toFixed(1)}</span>}
                                            <span className="rating-count">({center.review_cnt})</span>
                                        </div>

                                        {center.tags && (
                                            <div className="center-tags">
                                                {JSON.parse(center.tags).map((tag) => (
                                                    <span key={tag.tag_idx} className="tag"  style={{fontSize:"1.2rem"}}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    )}

                        {searchType==='all' && (
                            <div style={{display: 'flex', gap:"inherit"}}>
                                <div className="result-section" style={{width:'50%'}}>
                                    <div className="center-results" >
                                        <div className="search-title" style={{fontSize:'1.5rem'}}>센터</div>
                                        {searchResults.centers.map((center) => (
                                            <div key={center.center_idx} className="center-card">
                                                <div className="center-image" style={{width:"fit-content"}}>
                                                    <img
                                                        //src={center.center_image || '/default-center.jpg'}
                                                        src={`http://localhost/profileImg/profile/${center.center_id}`}
                                                        alt={center.center_name}
                                                        width={150}
                                                        height={150}
                                                        className="facility-image"
                                                    />
                                                </div>

                                                <div className="center-info" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                    <div style={{display: 'flex', gap:"inherit"}}>
                                                        <h4 className="center-name" style={{fontSize:'2rem', fontWeight:"bold", textAlign:"left", width:'100%'}}>{center.center_name}</h4>

                                                        <div className="center-rating" style={{justifyContent: "flex-end"}}>
                                                            <FaStar className="star-icon" />
                                                            {center.cnt > 0 &&
                                                                <span className="rating" style={{fontSize:"1.6rem"}}>{center.rating>1?center.rating : center.rating.toFixed(1)}</span>}
                                                            <span className="rating-count" style={{fontSize:'1.2rem'}}>({center.cnt})</span>
                                                        </div>
                                                    </div>
                                                    <div className="center-address">
                                                        <FaMapMarkerAlt className="location-icon" />
                                                        <span style={{fontSize:"1.6rem"}}>{center.address}</span>
                                                    </div>

                                                    <div className="center-price" style={{textAlign:"left"}}>
                                                        <span className="label">최저 가격:</span>
                                                        {center.price && <span className="value">{center.price.toLocaleString()}원~</span>}
                                                    </div>

                                                    {center.tags && (
                                                    <div className="center-tags" style={{marginTop:'0px'}}>
                                                        {JSON.parse(center.tags).map((tag) => (
                                                            <span key={tag} className="mypage_tag" style={{fontSize:"1.3rem"}}>{tag}</span>
                                                        ))}
                                                    </div>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="result-section" style={{width:'50%'}}>
                                    <div className="center-results">
                                        <div className="search-title" style={{fontSize:'1.5rem'}}>트레이너</div>
                                        {searchResults.trainers.map((trainer) => (
                                            <div key={trainer.user_id} className="center-card" style={{height:'178px'}}>
                                                    <div className="center-image"  style={{width:"fit-content"}}>
                                                        <img
                                                            //src={trainer.profile_image || '/default-profile.jpg'}
                                                            src={`http://localhost/profileImg/profile/${trainer.trainer_id}`}
                                                            alt={trainer.user_name}
                                                            width={150}
                                                            height={150}
                                                            className="facility-image"
                                                        />
                                                    </div>

                                                    <div className="center-info" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                        <div style={{display: 'flex', gap:"inherit"}}>
                                                            <h4 className="center-name" style={{fontSize:'2rem', fontWeight:"bold", textAlign:"left", width:'100%'}}>{trainer.user_name}</h4>

                                                            <div className="center-rating" style={{justifyContent: "flex-end"}}>
                                                                <FaStar className="star-icon" />
                                                                {trainer.cnt > 0 &&
                                                                <span className="rating" style={{fontSize:"1.6rem"}}>{trainer.rating > 1 ? trainer.rating : trainer.rating.toFixed(1)}</span>}
                                                                <span className="rating-count" style={{fontSize:'1.2rem'}}>({trainer.cnt})</span>
                                                            </div>
                                                        </div>
                                                        <div className="center-address">
                                                            <FaMapMarkerAlt className="location-icon" />
                                                            <span style={{fontSize:"1.6rem"}}>{trainer.center_name}</span>
                                                        </div>

                                                        {/*<div className="trainer-exercise-type">*/}
                                                        {/*    <span className="label">전문 분야:</span>*/}
                                                        {/*    <span className="value">{trainer.exercise_type}</span>*/}
                                                        {/*</div>*/}

                                                        <div className="center-price" style={{textAlign:"left"}}>
                                                            <span className="label">최저 가격:</span>
                                                            {trainer.price && <span className="value">{trainer.price.toLocaleString()}원~</span>}
                                                        </div>
                                                        {trainer.tags && (
                                                        <div className="center-tags" style={{marginTop:'0px'}}>
                                                            {JSON.parse(trainer.tags).map((tag) => (
                                                                <span key={tag} className="mypage_tag" style={{fontSize:"1.3rem"}}>{tag}</span>
                                                            ))}
                                                        </div>
                                                        )}
                                                    </div>
                                                </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                </div>
            )}
            </div>
        </div>
        <Footer/>
    </div>
    );
};

export default NameSearch;
