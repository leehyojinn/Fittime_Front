'use client'

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import QuickMenu from './QuickMenu';
import Image from 'next/image';
import Popup from './Popup';
import { useSidebarStore } from './zustand/store';
import Sidebar from './sidebar';
import { set } from 'date-fns';

const mainMenus = [
  {
    title: '회사 소개',
    submenu: [
      { label: '소개', href: '/component/introduce' },
    ],
    href: '/component/introduce',
  },
  {
    title: '서비스',
    submenu: [
      { label: '운동기관 검색', href: '/component/centersearch' },
      { label: '트레이너 검색', href: '/component/trainersearch' },
      { label: '이름 검색 (트레이너, 운동기관)', href: '/component/namesearch' },
    ],
    href: '/component/centersearch',
  },
  {
    title: '캘린더',
    submenu: [
      { label: '캘린더', href: '/component/calendar' },
    ],
    href: '/component/calendar',
  },
  {
    title: '게시판',
    submenu: [
      { label: '공지사항 게시판', href: '/component/board' },
      { label: '이벤트 게시판', href: '/component/board/event' },
      { label: 'QnA 게시판', href: '/component/board/qna' },
      { label: '건의사항 게시판', href: '/component/board/suggestions' },
    ],
    href: '/component/board',
  },
];

const Header = () => {

  const { openSidebar } = useSidebarStore();
  
  const [token, setToken] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  
  useEffect(() => {
    // 클라이언트에서만 sessionStorage 접근 가능
    if (typeof window !== 'undefined') {
      setToken(sessionStorage.getItem('token'));
      setUserLevel(sessionStorage.getItem('user_level'));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_level');
    setToken(null);
    window.location.href = '/';
  };

  return (
    <div className='header'>
      <Popup/>
      <Sidebar/>
      <div className='wrap flex justify_con_space_between align_center'>
        <Link href={"/"}>
          <Image src="/white_icon_logo.png" alt="logo" width={90} height={90} className='logo' />
        </Link>
        <div className='flex align_center gap_10 width_fit'>
          {token ? (
            <>
              <button
                className='content_text white_color'
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={handleLogout}
              >
                로그아웃
              </button>
              {userLevel == 0 || userLevel == 1 ? <Link href="/component/membermypage">
                <p className='content_text white_color'>마이페이지</p>
              </Link> : ''}
              {userLevel == 2 ? <Link href="/component/trainermypage">
                <p className='content_text white_color'>마이페이지</p>
              </Link> : ''}
              {userLevel == 3 ? <Link href="/component/centermypage">
                <p className='content_text white_color'>마이페이지</p>
              </Link> : ''}
              {userLevel >= 4 ? <Link href="/component/membermypage">
                <p className='content_text white_color'>마이페이지</p>
              </Link> : ''}

            </>
          ) : (
            <>
              <Link href={"/component/login"}>
                <p className='content_text white_color'>로그인</p>
              </Link>
              <Link href={"/component/join"}>
                <p className='content_text white_color'>회원가입</p>
              </Link>
            </>
          )}
          
        </div>
      </div>
      <nav className='navigation_bar wrap flex justify_con_space_between border_top_ccc'>
        {mainMenus.map((menu, idx) => (
          <div className="menu-item" key={idx}>
            <Link href={menu.href}>
              <p className='content_text white_color padding_20 box_sizing menu-title'>
                {menu.title}
              </p>
            </Link>
            <div className="submenu">
              {menu.submenu.map((sub, subIdx) => (
                <Link href={sub.href} key={subIdx}>
                  <p className="submenu-item">{sub.label}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div>
        <QuickMenu/>
      </div>
      {userLevel >= 3 ? (<button onClick={openSidebar} className='sidebar'>
      ≡
      </button>) : ('')}
      
    </div>
  );
};

export default Header;
