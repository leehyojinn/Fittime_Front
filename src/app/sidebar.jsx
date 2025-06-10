'use client'

import Link from 'next/link';
import React, { use, useEffect, useState } from 'react';
import {useSidebarStore} from './zustand/store';

const Sidebar = () => {
    const {isSidebarOpen, closeSidebar} = useSidebarStore();
    const [sidebarLinks, setLinks] = useState([]);

    // 메뉴 정의
    const adminLinks = [
        { label: 'Home', href: '/' },
        { label: '팝업 등록', href: '/component/popup_write' },
        { label: '관리자 부여', href: '/component/grant'},
        { label: '블랙리스트 관리', href: '/component/blacklist'},
        { label: '태그 등록', href: '/component/tagmanagement'},
    ];
    const centerLinks = [
        { label: '상품 등록', href: '/component/product'},
        // { label: '신고하기', href: '/component/complaint'},
        { label: '클래스 등록', href: '/component/classmanagement'},
        { label: '통계', href: '/component/dashboard'}
    ];

    const centerLinks_2 = [
        { label: '대시보드', href: '/component/dashboard'},
        { label: '상품 등록', href: '/component/product'},
        { label: '신고하기', href: '/component/complaint'},
    ];

    useEffect(() => {
        // 클라이언트에서만 sessionStorage 접근 가능
        if (typeof window !== 'undefined') {
            const userLevel = sessionStorage.getItem('user_level');
            const exercise_level = sessionStorage.getItem('exercise_level');
            if (userLevel > '3') {
                setLinks(adminLinks);
            } else if (userLevel === '3') {
                if(exercise_level === '1'){
                    setLinks(centerLinks_2);
                }else{
                    setLinks(centerLinks);
                }
            }
        }
    },[]);

    return (
        <div>
            {/* 오버레이 */}
            <div
                onClick={closeSidebar}
                style={{
                    display: isSidebarOpen
                        ? 'block'
                        : 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.3)',
                    zIndex: 2000
                }}/> 
            {/* 사이드바 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isSidebarOpen
                        ? 0
                        : '-260px',
                    width: 260,
                    height: '100vh',
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                    zIndex: 2100,
                    transition: 'left 0.3s',
                    padding: 25,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <div className='flex column gap_10'>
                    <span style={{cursor:'pointer',marginLeft:'auto'}} className="material-symbols-outlined" onClick={closeSidebar}>close</span>
                    {
                        sidebarLinks.map((item, idx) => (
                            <Link
                                href={item.href}
                                key={idx}
                                className='content_text sidebar_text'
                                >
                                {item.label}
                            </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
