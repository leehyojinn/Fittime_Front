'use client';

import React, { useEffect, useRef } from 'react';

const KakaoMap = ({Lat,Lng}) => {
  const mapRef = useRef(null);

  useEffect(() => {

    if (window.kakao && window.kakao.maps) {
      createMap();
    } else {
      const script = document.createElement('script');
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=49fdf6afc79c0317cd978996d5084130&autoload=false";
      script.async = true;
      script.onload = () => window.kakao.maps.load(createMap);
      document.head.appendChild(script);
    }

    function createMap() {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(Lat, Lng), 
        level: 3
      };
      new window.kakao.maps.Map(container, options);
    }
  }, []);

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
