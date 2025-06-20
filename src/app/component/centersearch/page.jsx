'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaFilter, FaMapMarkedAlt } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from "axios";
import {useRouter} from "next/navigation";
import { useAuthStore } from '@/app/zustand/store';

const CenterSearch = () => {
  // 상태 관리
  const [location, setLocation] = useState({ city: '', district: '', neighborhood: '' });
  const [exerciseType, setExerciseType] = useState('전체');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    tags: []
  });
  const [sortOption, setSortOption] = useState('rating');
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const router = useRouter();

    const handleMoveCenter = (id) =>{
        router.push(`/component/centerdetail?center_id=${id}`)
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { noGuest: true });
    }, [checkAuthAndAlert, router]);

    useEffect(() => {
        getCity();
    }, []);

  const getCity = async () => {
      const {data}= await axios.post(`${apiUrl}/get/city`);
      console.log(data);
      setCityOptions(data.City);
  }

  // 운동 종목 옵션
  const exerciseOptions = [
    '전체', '헬스', 'PT', '필라테스', '요가', '골프', '크로스핏', '복싱', '수영'
  ];

  // 위치 옵션 로드
  useEffect(() => {
    if (location.city) {
      // API 호출하여 해당 도시의 구 옵션 로드
      //const mockDistricts = ['강남구', '서초구', '송파구', '마포구', '중구', '강동구'];
      axios.post(`${apiUrl}/get/district`,{"sido":location.city})
          .then(({data}) => {
              setDistrictOptions(data.District);
              console.log(data);
        })
      //setDistrictOptions(mockDistricts);
    }
  }, [location.city]);

  useEffect(() => {
    if (location.district) {
      // API 호출하여 해당 구의 동 옵션 로드
      // const mockNeighborhoods = ['역삼동', '삼성동', '대치동', '서초동', '잠실동', '송파동'];
      // setNeighborhoodOptions(mockNeighborhoods);
        axios.post(`${apiUrl}/get/neighborhood`,{"sido":location.city ,"gugun":location.district})
        .then(({data}) => {
            setNeighborhoodOptions(data.Neighborhood);
            console.log(data);
        })
    }
  }, [location.district]);

  // 태그 로드
  useEffect(() => {
    // API 호출하여 센터 태그 로드
    const mockTags = ['24시간', '샤워시설', '피트니스', '주차가능', '락커', '무료 PT'];
    axios.post(`${apiUrl}/tag_list`,{category:"센터"})
        .then(({data}) => {
            console.log(data);
            setAvailableTags(data.list);
        })
    //setAvailableTags(mockTags);
  }, []);

  // 검색 실행
  const handleSearch = async () => {
    // API 호출하여 검색 결과 로드
    

      const {data} = await axios.post(`${apiUrl}/search/location`,
          {
              "sido":location.city,
              "gugun":location.district,
              "eupmyeondong":location.neighborhood,
              "exercise":exerciseType
          });

      console.log(data);

    setSearchResults(data.list);
    applyFilters(data.list);
  };

  // 필터 적용
  const applyFilters = (results) => {
    let filtered = [...results];
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(center => center.rating >= filters.minRating);
    }
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(center => {
            if(!center.tags){
                return false;
            }

            return filters.tags.some(tag => JSON.parse(center.tags).includes(tag))
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
          <p className='title'>운동기관 검색</p>
        </div>
        <div className='wrap padding_120_0'>

            <div className="center-search-container">
            <h2 className="search-title">운동기관 검색</h2>
            
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
                
                {/* <button
                    className={`map-button ${showMap ? 'active' : ''}`}
                    onClick={() => setShowMap(!showMap)}
                >
                    <FaMapMarkedAlt /> {showMap ? '목록 보기' : '지도 보기'}
                </button> */}
                </div>
            </div>
            
            {isFilterOpen && (
                <div className="filter-panel">
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
                    <h3>정렬</h3>
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
            
            {showMap ? (
                <div className="map-container">
                <div className="map-placeholder">
                    <p>지도 API가 여기에 로드됩니다.</p>
                    <p>실제 구현 시 카카오맵 또는 네이버맵 API를 사용할 수 있습니다.</p>
                    
                    {filteredResults?.length > 0 && (
                    <div className="map-markers">
                        <h3>지도에 표시될 센터:</h3>
                        <ul>
                        {filteredResults?.map(center => (
                            <li key={center.center_idx}>
                            {center.center_name} - {center.address}
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>
                </div>
            ) : (
                <div className="search-results">
                {filteredResults?.length > 0 ? (
                    filteredResults?.map((center) => (
                    <div key={center.center_idx} className="center-card" onClick={()=>handleMoveCenter(center.center_id)}>
                        <div className={"center-image"} style={{width:"fit-content"}}>
                        <img
                            //src={center.center_image || '/default-center.jpg'}
                            src={`${apiUrl}/profileImg/profile/${center.center_id}`}
                            alt={center.center_name}
                            className="facility-image"
                        />
                        </div>
                        
                        <div className="center-info">
                        <h3 className="center-name">{center.center_name}</h3>
                        
                        <div className="center-address" style={{fontSize:"1.5rem"}}>
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
                            <span className="rating-count" style={{fontSize:"1.4rem"}}>({center.review_cnt})</span>
                        </div>

                        {center.tags && (
                        <div className="center-tags">
                            {JSON.parse(center.tags).map((tag,idx) => (
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
                        ? '필터 조건에 맞는 센터가 없습니다. 다른 조건으로 검색해보세요.' 
                        : '검색 버튼을 클릭하여 센터를 찾아보세요.'}
                    </div>
                )}
                </div>
            )}
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default CenterSearch;
