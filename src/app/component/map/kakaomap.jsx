'use client';

import React, { useEffect, useRef } from 'react';

const KakaoMap = ({ address }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // address가 없으면 기본값으로 "서울 종로구 종로3가" 사용
    const searchAddress = address && address.trim() !== ''
      ? address
      : '서울 종로구 종로3가';

    // 카카오맵 스크립트 로드
    if (window.kakao && window.kakao.maps) {
      loadMap();
    } else {
      const script = document.createElement('script');
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=49fdf6afc79c0317cd978996d5084130&autoload=false&libraries=services";
      script.async = true;
      script.onload = () => window.kakao.maps.load(loadMap);
      document.head.appendChild(script);
    }

    function loadMap() {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(searchAddress, function(result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);

          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3
          };
          const map = new window.kakao.maps.Map(container, options);

          // 마커 표시
          new window.kakao.maps.Marker({
            map,
            position: new window.kakao.maps.LatLng(lat, lng)
          });
        }
      });
    }
  }, [address]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        margin: '24px 0'
      }}
    />
  );
};

export default KakaoMap;
