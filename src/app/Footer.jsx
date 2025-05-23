import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <div className='footer'>
            <div className='wrap flex justify_con_space_between align_center'>
                <Link href={"/"}>
                    <Image src="/white_icon_logo.png" alt="logo" width={90} height={90} className='logo' />
                </Link>
                <div>
                    <p className='label white_color text_left'>팀명 : fitTime</p>
                    <p className='label white_color text_left'>연락처 : 000-000-0000</p>
                    <p className='label white_color text_left'>저작권 정보: 우리팀. All rights reserved.</p>
                    <p className='label white_color text_left'>광고문의 : 777gin@naver.com</p>
                </div>
            </div>
        </div>
    );
};

export default Footer;