'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const quickMenus = [
  { label: '홈', icon: <span className="material-symbols-outlined">home</span>, href: '/' },
  { label: '검색', icon: <span className="material-symbols-outlined">search</span>, href: '/component/centersearch' },
  { label: '캘린더', icon: <span className="material-symbols-outlined">calendar_month</span>, href: '/component/calendar' },
  { label: '공지사항', icon: <span className="material-symbols-outlined">developer_board</span>, href: '/component/board' },
];

const QuickMenu = () => {
  const [visible, setVisible] = useState(true);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <div className={`quick-menu${visible ? '' : ' hide'}`}>
        <button className="quick-hide-btn" onClick={() => setVisible(false)} title="퀵메뉴 숨기기">▶</button>
        <ul className='flex column gap_10'>
          {quickMenus.map((menu, idx) => (
            <li key={idx}>
              <Link href={menu.href} className="quick-link">
                <span className="quick-icon label">{menu.icon}</span>
                <span className="label">{menu.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button className="quick-top-btn" onClick={handleScrollTop} title="상단으로 이동">▲</button>
      </div>
      {!visible && (
        <button className="quick-show-btn" onClick={() => setVisible(true)} title="퀵메뉴 보이기">◀</button>
      )}
    </>
  );
};

export default QuickMenu;
