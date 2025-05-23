'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaMapMarkerAlt, FaFilter, FaMapMarkedAlt } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';

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
  const [cityOptions, setCityOptions] = useState(['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '제주']);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // 운동 종목 옵션
  const exerciseOptions = [
    '전체', '헬스', 'PT', '필라테스', '요가', '골프', '크로스핏', '복싱', '수영'
  ];

  // 위치 옵션 로드
  useEffect(() => {
    if (location.city) {
      // API 호출하여 해당 도시의 구 옵션 로드
      const mockDistricts = ['강남구', '서초구', '송파구', '마포구', '중구', '강동구'];
      setDistrictOptions(mockDistricts);
    }
  }, [location.city]);

  useEffect(() => {
    if (location.district) {
      // API 호출하여 해당 구의 동 옵션 로드
      const mockNeighborhoods = ['역삼동', '삼성동', '대치동', '서초동', '잠실동', '송파동'];
      setNeighborhoodOptions(mockNeighborhoods);
    }
  }, [location.district]);

  // 태그 로드
  useEffect(() => {
    // API 호출하여 센터 태그 로드
    const mockTags = ['24시간', '샤워시설', '피트니스', '주차가능', '락커', '무료 PT'];
    setAvailableTags(mockTags);
  }, []);

  // 검색 실행
  const handleSearch = () => {
    // API 호출하여 검색 결과 로드
    const mockResults = [
      {
        center_idx: 1,
        center_name: '헬스월드 강남점',
        center_image: '/center1.jpg',
        lowest_price: 80000,
        tags: ['24시간', '샤워시설', '피트니스'],
        rating: 4.6,
        rating_count: 48,
        address: '서울 강남구 역삼동 123-45',
        description: '최신 장비를 갖춘 24시간 헬스장입니다.'
      },
      {
        center_idx: 2,
        center_name: '파워짐 송파점',
        center_image: '/center2.jpg',
        lowest_price: 70000,
        tags: ['피트니스', '무료 PT', '락커'],
        rating: 4.8,
        rating_count: 36,
        address: '서울 송파구 잠실동 456-78',
        description: '합리적인 가격과 전문 트레이너가 함께하는 헬스장입니다.'
      },
      {
        center_idx: 3,
        center_name: '웰니스 필라테스',
        center_image: '/center3.jpg',
        lowest_price: 150000,
        tags: ['샤워시설', '주차가능'],
        rating: 4.9,
        rating_count: 27,
        address: '서울 서초구 서초동 789-10',
        description: '1:1 맞춤 필라테스 수업을 제공합니다.'
      }
    ];
    
    setSearchResults(mockResults);
    applyFilters(mockResults);
  };

  // 필터 적용
  const applyFilters = (results) => {
    let filtered = [...results];
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(center => center.rating >= filters.minRating);
    }
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(center => 
        filters.tags.some(tag => center.tags.includes(tag))
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
    applyFilters(searchResults);
  };

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
                    <label>시/도</label>
                    <select 
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value, district: '', neighborhood: '' })}
                    >
                    <option value="">선택하세요</option>
                    {cityOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                    </select>
                </div>
                
                <div className="select-group">
                    <label>구/군</label>
                    <select 
                    value={location.district}
                    onChange={(e) => setLocation({ ...location, district: e.target.value, neighborhood: '' })}
                    disabled={!location.city}
                    >
                    <option value="">선택하세요</option>
                    {districtOptions.map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                    </select>
                </div>
                
                <div className="select-group">
                    <label>동/읍/면</label>
                    <select 
                    value={location.neighborhood}
                    onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
                    disabled={!location.district}
                    >
                    <option value="">선택하세요</option>
                    {neighborhoodOptions.map((neighborhood) => (
                        <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                    </select>
                </div>
                </div>
                
                <div className="exercise-selector">
                <label>운동 종목</label>
                <div className="exercise-options">
                    {exerciseOptions.map((exercise) => (
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
                    <h3>최소 별점</h3>
                    <div className="rating-slider">
                    <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5" 
                        value={filters.minRating}
                        onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    />
                    <span>{filters.minRating} 이상</span>
                    </div>
                </div>
                
                <div className="filter-section">
                    <h3>태그</h3>
                    <div className="tag-options">
                    {availableTags.map((tag) => (
                        <label key={tag} className="tag-checkbox">
                        <input 
                            type="checkbox" 
                            checked={filters.tags.includes(tag)}
                            onChange={() => toggleTag(tag)}
                        />
                        {tag}
                        </label>
                    ))}
                    </div>
                </div>
                
                <div className="filter-section">
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
                </div>
                </div>
            )}
            
            {showMap ? (
                <div className="map-container">
                <div className="map-placeholder">
                    <p>지도 API가 여기에 로드됩니다.</p>
                    <p>실제 구현 시 카카오맵 또는 네이버맵 API를 사용할 수 있습니다.</p>
                    
                    {filteredResults.length > 0 && (
                    <div className="map-markers">
                        <h3>지도에 표시될 센터:</h3>
                        <ul>
                        {filteredResults.map(center => (
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
                {filteredResults.length > 0 ? (
                    filteredResults.map((center) => (
                    <div key={center.center_idx} className="center-card">
                        <div className="center-image">
                        <Image 
                            src={center.center_image || '/default-center.jpg'} 
                            alt={center.center_name}
                            width={200}
                            height={150}
                            className="facility-image"
                        />
                        </div>
                        
                        <div className="center-info">
                        <h3 className="center-name">{center.center_name}</h3>
                        
                        <div className="center-address">
                            <FaMapMarkerAlt className="location-icon" />
                            <span>{center.address}</span>
                        </div>
                        
                        <div className="center-description">
                            {center.description}
                        </div>
                        
                        <div className="center-price">
                            <span className="label">최저 가격:</span>
                            <span className="value">{center.lowest_price.toLocaleString()}원~</span>
                        </div>
                        
                        <div className="center-rating">
                            <FaStar className="star-icon" />
                            <span className="rating">{center.rating.toFixed(1)}</span>
                            <span className="rating-count">({center.rating_count})</span>
                        </div>
                        
                        <div className="center-tags">
                            {center.tags.map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
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
