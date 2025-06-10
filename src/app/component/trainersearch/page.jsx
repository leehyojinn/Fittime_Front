'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import Footer from '../../Footer';
import Header from '../../Header';
import axios from "axios";
import {useRouter} from "next/navigation";
import { useAuthStore } from '@/app/zustand/store';

const TrainerSearch = () => {
  // 상태 관리
  const [location, setLocation] = useState({ city: '', district: '', neighborhood: '' });
  const [exerciseType, setExerciseType] = useState('전체');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'all',
    minRating: 0,
    tags: []
  });
  const [sortOption, setSortOption] = useState('rating');
  const [cityOptions, setCityOptions] = useState(['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '제주']);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  useEffect(() => {
      checkAuthAndAlert(router, null, { noGuest: true });
  }, [checkAuthAndAlert, router]);

    const handleMoveTrainer = (id) =>{
        router.push(`/component/trainerdetail?trainer_id=${id}`)
    }

    useEffect(() => {
        getCity();
    }, []);

    const getCity = async () => {
        const {data}= await axios.post('http://localhost/get/city');
        console.log(data);
        setCityOptions(data.City);
    }

  // 운동 종목 옵션
  const exerciseOptions = [
    '전체', '헬스', 'PT', '필라테스', '요가', '골프', '크로스핏', '복싱', '수영'
  ];

  // 위치 옵션 로드 (도시 선택 시 해당 구/동 옵션 로드)
  useEffect(() => {
    if (location.city) {
      // API 호출하여 해당 도시의 구 옵션 로드
      // const mockDistricts = ['강남구', '서초구', '송파구', '마포구', '중구', '강동구'];
      // setDistrictOptions(mockDistricts);
        axios.post('http://localhost/get/district',{"sido":location.city})
            .then(({data}) => {
                setDistrictOptions(data.District);
                console.log(data);
            })
    }
  }, [location.city]);

  useEffect(() => {
    if (location.district) {
      // API 호출하여 해당 구의 동 옵션 로드
      // const mockNeighborhoods = ['역삼동', '삼성동', '대치동', '서초동', '잠실동', '송파동'];
      // setNeighborhoodOptions(mockNeighborhoods);
        axios.post('http://localhost/get/neighborhood',{"sido":location.city ,"gugun":location.district})
            .then(({data}) => {
                setNeighborhoodOptions(data.Neighborhood);
                console.log(data);
            })
    }
  }, [location.district]);

  // 태그 로드
  useEffect(() => {
    // API 호출하여 트레이너 태그 로드
    // const mockTags = ['유경험자', '친절한', '체계적인', '열정적인', '세심한', '커리큘럼 보유'];
    // setAvailableTags(mockTags);
      axios.post('http://localhost/tag_list',{category:"트레이너"})
          .then(({data}) => {
              console.log(data);
              setAvailableTags(data.list);
          })
  }, []);

  // 검색 실행
  const handleSearch = async() => {
    // API 호출하여 검색 결과 로드
    const mockResults = [
      {
        user_id: 'trainer1',
        user_name: '김트레이너',
        profile_image: '/trainer1.jpg',
        center_name: '헬스월드 강남점',
        lowest_price: 100000,
        exercise_type: 'PT',
        tags: ['친절한', '체계적인', '열정적인'],
        rating: 4.8,
        rating_count: 24,
        gender: '남'
      },
      {
        user_id: 'trainer2',
        user_name: '박트레이너',
        profile_image: '/trainer2.jpg',
        center_name: '피트니스클럽',
        lowest_price: 120000,
        exercise_type: '필라테스',
        tags: ['유경험자', '세심한'],
        rating: 4.9,
        rating_count: 18,
        gender: '여'
      },
      {
        user_id: 'trainer3',
        user_name: '이트레이너',
        profile_image: '/trainer3.jpg',
        center_name: '파워짐',
        lowest_price: 90000,
        exercise_type: '크로스핏',
        tags: ['열정적인', '커리큘럼 보유'],
        rating: 4.7,
        rating_count: 32,
        gender: '남'
      }
    ];

      const {data} = await axios.post('http://localhost/search/trainer',
          {
              "sido":location.city,
              "gugun":location.district,
              "eupmyeondong":location.neighborhood,
              "exercise":exerciseType
          });

    console.log(data.list);
    setSearchResults(data.list);
    applyFilters(data.list);
  };

  // 필터 적용
  const applyFilters = (results) => {
    let filtered = [...results];
    
    if (filters.gender !== 'all') {
      filtered = filtered.filter(trainer => trainer.gender === filters.gender);
    }
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(trainer => trainer.rating >= filters.minRating);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(trainer => {
              if (!trainer.tags) {
                  return false;
              }

              return filters.tags.some(tag => JSON.parse(trainer.tags).includes(tag))
          }
      );
    }
    
    if (sortOption === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'price') {
      filtered.sort((a, b) => a.lowest_price - b.lowest_price);
    }
    
    setFilteredResults(filtered);
  };

  // 필터 변경 처리
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

    useEffect(() => {
        applyFilters(searchResults);
    }, [filters]);

  // 태그 토글
  const toggleTag = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    handleFilterChange('tags', newTags);
  };

  return (
    <div>
        <Header/>
        <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
          <p className='title'>트레이너 검색</p>
        </div>
        <div className='padding_120_0 wrap'>

            <div className="trainer-search-container">
            <h2 className="search-title">트레이너 검색</h2>
            
            <div className="search-panel">
                <div className="location-selector">
                <div className="select-group">
                    <label className='label'>시/도</label>
                    <select 
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value, district: '', neighborhood: '' })}
                    >
                    <option value="">선택하세요</option>
                    {cityOptions?.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                    </select>
                </div>
                
                <div className="select-group">
                    <label className='label'>구/군</label>
                    <select 
                    value={location.district}
                    onChange={(e) => setLocation({ ...location, district: e.target.value, neighborhood: '' })}
                    disabled={!location.city}
                    >
                    <option value="">선택하세요</option>
                    {districtOptions?.map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                    </select>
                </div>
                
                <div className="select-group">
                    <label className='label'>동/읍/면</label>
                    <select 
                    value={location.neighborhood}
                    onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
                    disabled={!location.district}
                    >
                    <option value="">선택하세요</option>
                    {neighborhoodOptions?.map((neighborhood) => (
                        <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                    </select>
                </div>
                </div>
                
                <div className="exercise-selector">
                <label className='middle_title2'>운동 종목</label>
                <div className="exercise-options">
                    {exerciseOptions?.map((exercise) => (
                    <button 
                        key={exercise}
                        className={exerciseType === exercise ? 'active' : ''}
                        onClick={() => setExerciseType(exercise)}
                    >
                        {exercise}
                    </button>
                    ))}
                </div>
                </div>
                
                <div className="search-actions">
                <button className="btn label white_color" onClick={handleSearch}>
                    검색하기
                </button>
                
                <button 
                    className={`btn label white_color ${isFilterOpen ? 'active' : ''}`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <FaFilter /> 필터
                </button>
                </div>
            </div>
            
            {isFilterOpen && (
                <div className="filter-panel">
                <div className="filter-section">
                    <h3 className='page-title mb_10'>성별</h3>
                    <div className="radio-group">
                    <label>
                        <input 
                        type="radio" 
                        checked={filters.gender === 'all'} 
                        onChange={() => handleFilterChange('gender', 'all')}
                        />
                        전체
                    </label>
                    <label>
                        <input 
                        type="radio" 
                        checked={filters.gender === '남자'}
                        onChange={() => handleFilterChange('gender', '남자')}
                        />
                        남성
                    </label>
                    <label>
                        <input 
                        type="radio" 
                        checked={filters.gender === '여자'}
                        onChange={() => handleFilterChange('gender', '여자')}
                        />
                        여성
                    </label>
                    </div>
                </div>
                
                <div className="filter-section">
                    <h3 className='page-title mb_10'>최소 별점</h3>
                    <div className="rating-slider justify_con_center">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className="star-icon"
                            size={26}
                            color={filters.minRating >= star ? "#F2C265" : "#d3d3d3"}
                            style={{ cursor: "pointer", marginRight: 2 }}
                            onClick={() => handleFilterChange('minRating', star)}
                            aria-label={`${star}점 이상`}
                        />
                        ))}
                        <span className="min-rating-label">{filters.minRating} 이상</span>
                    </div>
                </div>
                
                <div className="filter-section">
                    <h3 className='page-title mb_10'>태그</h3>
                    <div className="tag-options">
                    {availableTags.map((tag) => (
                        <label key={tag.tag_idx} className="tag-checkbox">
                        <input 
                            type="checkbox" 
                            checked={filters.tags.includes(tag.tag_name)}
                            onChange={() => toggleTag(tag.tag_name)}
                        />
                        {tag.tag_name}
                        </label>
                    ))}
                    </div>
                </div>
                
                {/* <div className="filter-section">
                    <h3 className='page-title mb_10'>정렬</h3>
                    <div className="radio-group">
                    <label>
                        <input 
                        type="radio" 
                        checked={sortOption === 'rating'} 
                        onChange={() => {
                            setSortOption('rating');
                            applyFilters(searchResults);
                        }}
                        />
                        별점 높은 순
                    </label>
                    <label>
                        <input 
                        type="radio" 
                        checked={sortOption === 'price'} 
                        onChange={() => {
                            setSortOption('price');
                            applyFilters(searchResults);
                        }}
                        />
                        가격 낮은 순
                    </label>
                    </div>
                </div> */}
                </div>
            )}
            
            <div className="search-results">
                {filteredResults.length > 0 ? (
                filteredResults.map((trainer) => (
                    <div key={trainer.user_id} className="trainer-card" onClick={()=>handleMoveTrainer(trainer.user_id)}>
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
                        
                        <div className="trainer-center"  style={{fontSize: "1.5rem"}}>
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
                        <span className="rating-count"style={{fontSize:"1.4rem"}}>({trainer.review_cnt})</span>
                        </div>

                        {trainer.tags && (
                        <div className="trainer-tags">
                        {JSON.parse(trainer.tags).map((tag,idx) => (
                            <span key={idx} className="tag"  style={{fontSize:"1.5rem"}}>{tag}</span>
                        ))}
                        </div>
                            )}
                    </div>
                    </div>
                ))
                ) : (
                <div className="no-results">
                    {searchResults.length > 0 
                    ? '필터 조건에 맞는 트레이너가 없습니다. 다른 조건으로 검색해보세요.' 
                    : '검색 버튼을 클릭하여 트레이너를 찾아보세요.'}
                </div>
                )}
            </div>
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default TrainerSearch;
