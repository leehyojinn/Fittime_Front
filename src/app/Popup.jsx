'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

const Popup = () => {
    const [popupData, setPopupData] = useState([]);
    const [visiblePopups, setVisiblePopups] = useState({});
    const [positions, setPositions] = useState({});
    const [dragInfo, setDragInfo] = useState({}); // { [popup_idx]: {isDragging, diff} }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // 팝업 데이터 불러오기
    const fetchPopupData = async () => {
        const { data } = await axios.get(`${apiUrl}/popup_list`);
        setPopupData(data.data || []);
    };

    useEffect(() => {
        fetchPopupData();
    }, []);

    // 각 팝업별로 24시간 닫기 체크
    useEffect(() => {
        if (popupData.length > 0) {
            const now = new Date().getTime();
            const newVisiblePopups = {};
            popupData.forEach(popup => {
                if (!popup.use_toggle) return; // use_toggle이 false면 표시 안함
                const closedTime = localStorage.getItem(`popupClosedTime_${popup.popup_idx}`);
                if (closedTime) {
                    const diff = now - parseInt(closedTime, 10);
                    newVisiblePopups[popup.popup_idx] = diff >= 24 * 60 * 60 * 1000;
                } else {
                    newVisiblePopups[popup.popup_idx] = true;
                }
            });
            setVisiblePopups(newVisiblePopups);
        }
        
    }, [popupData]);

    // 드래그 관련 함수
    const onMouseDown = (popup_idx, e) => {
        setDragInfo(prev => ({
            ...prev,
            [popup_idx]: {
                isDragging: true,
                diff: {
                    x: e.clientX - (positions[popup_idx]?.x || getInitialLeft(popup_idx)),
                    y: e.clientY - (positions[popup_idx]?.y || getInitialTop(popup_idx)),
                }
            }
        }));
    };

    const onMouseMove = (popup_idx, e) => {
        if (dragInfo[popup_idx]?.isDragging) {
            setPositions(prev => ({
                ...prev,
                [popup_idx]: {
                    x: e.clientX - dragInfo[popup_idx].diff.x,
                    y: e.clientY - dragInfo[popup_idx].diff.y
                }
            }));
        }
    };

    const onMouseUp = (popup_idx) => {
        setDragInfo(prev => ({
            ...prev,
            [popup_idx]: {
                ...prev[popup_idx],
                isDragging: false
            }
        }));
    };

    // 드래그 이벤트 등록
    useEffect(() => {
        const draggingIds = Object.keys(dragInfo).filter(
            id => dragInfo[id]?.isDragging
        );

        const moveHandlers = {};
        const upHandlers = {};

        draggingIds.forEach(idx => {
            moveHandlers[idx] = (e) => onMouseMove(idx, e);
            upHandlers[idx] = () => onMouseUp(idx);
            window.addEventListener('mousemove', moveHandlers[idx]);
            window.addEventListener('mouseup', upHandlers[idx]);
        });

        return () => {
            draggingIds.forEach(idx => {
                window.removeEventListener('mousemove', moveHandlers[idx]);
                window.removeEventListener('mouseup', upHandlers[idx]);
            });
        };
    }, [dragInfo, positions]);

    // 팝업의 초기 위치 계산 (API 값이 문자열이므로 Number 변환)
    const getInitialLeft = (popup_idx) => {
        const popup = popupData.find(p => p.popup_idx === popup_idx);
        return popup ? Number(popup.position_left) : 0;
    };
    const getInitialTop = (popup_idx) => {
        const popup = popupData.find(p => p.popup_idx === popup_idx);
        return popup ? Number(popup.position_top) : 0;
    };


    // 팝업 렌더링
    return (
        <>
            {popupData.map(popup => {
                // use_toggle이 false거나, 24시간 닫힌 팝업, 이미지 파일명 없는 팝업은 스킵
                if (!popup.use_toggle || !visiblePopups[popup.popup_idx] || !popup.file_name) return null;

                // 실제 이미지 경로
                const imageUrl = popup.file_name.startsWith('http')
                    ?  apiUrl + '/popup/' + popup.file_name
                    : apiUrl + '/popup/' + popup.file_name;

                const now = new Date();
                const startDate = popup.start_date ? new Date(popup.start_date) : null;
                const endDate = popup.end_date ? new Date(popup.end_date) : null;

                if (
                    (startDate && now < startDate) ||
                    (endDate && now > endDate)
                ) {
                    return null;
                }

                // 위치 및 크기
                const left = positions[popup.popup_idx]?.x ?? getInitialLeft(popup.popup_idx) + '%';
                const top = positions[popup.popup_idx]?.y ?? getInitialTop(popup.popup_idx) + '%';
                const width = Number(popup.popup_width) || 500;
                const height = Number(popup.popup_height) || 700;

                return (
                    <div
                        key={popup.popup_idx}
                        className='popup_wrap'
                        style={{
                            left,
                            top,
                            width,
                            height,
                            transform : `translate(-${left},-${top})`,
                            cursor: dragInfo[popup.popup_idx]?.isDragging ? 'grabbing' : 'grab',
                            position: 'absolute',
                            zIndex: 1000 + popup.popup_idx
                        }}
                        onMouseDown={(e) => onMouseDown(popup.popup_idx, e)}
                    >
                        <div className='popup_inner' style={{ width: '100%', height: '100%' }}>
                            <img
                                src={imageUrl}
                                alt={popup.title || 'popup'}
                                className="objfit_cover"
                                draggable={false}
                                style={{width:"100%",height:"100%" }}
                            />
                            <div className='position_rel' style={{ zIndex: 2 }}>
                                <div className='flex gap_10 align_center justify_con_center'>
                                    <button
                                        onClick={() => setVisiblePopups(prev => ({ ...prev, [popup.popup_idx]: false }))}
                                        className='btn label white_color'
                                    >
                                        닫기
                                    </button>
                                    <button
                                        onClick={() => {
                                            localStorage.setItem(`popupClosedTime_${popup.popup_idx}`, new Date().getTime().toString());
                                            setVisiblePopups(prev => ({ ...prev, [popup.popup_idx]: false }));
                                        }}
                                        className='btn label white_color'
                                    >
                                        24시간 닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default Popup;
