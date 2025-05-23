import React from 'react'
import Header from '../../Header'
import Footer from '../../Footer'
import Link from 'next/link'

export default function Suggestions() {
    return (
        <div>
            <Header/>
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title'>건의사항 게시판</p>
            </div>
            <div className='wrap padding_120_0'>
                <div className='flex justify_con_end'>
                    <Link href={'/component/board/boardwrite'} className='btn label white_color'>
                        <div>글쓰기</div>
                    </Link>
                </div>
                <div className='mt_20'>
                    <div className='flex justify_con_space_between gap_10 board_css'>
                        <p className='content_text width_200 text_left'>번호</p>
                        <p className='content_text flex_1'>제목</p>
                        <p className='content_text width_200'>아이디</p>
                        <p className='content_text width_200 text_right'>날짜</p>
                    </div>
                    {/* 확인용 데이터 링크걸기*/}
                    <div className='flex justify_con_space_between gap_10 board_css board_content'>
                        <p className='label width_200 text_left'>1</p>
                        <p className='label flex_1'>제목입니다.</p>
                        <p className='label width_200'>아이디입니다.</p>
                        <p className='label width_200 text_right'>2025-01-01</p>
                    </div>
                    <div className='flex justify_con_space_between gap_10 board_css board_content'>
                        <p className='label width_200 text_left'>1</p>
                        <p className='label flex_1'>제목입니다.</p>
                        <p className='label width_200'>아이디입니다.</p>
                        <p className='label width_200 text_right'>2025-01-01</p>
                    </div>
                    <div className='flex justify_con_space_between gap_10 board_css board_content'>
                        <p className='label width_200 text_left'>1</p>
                        <p className='label flex_1'>제목입니다.</p>
                        <p className='label width_200'>아이디입니다.</p>
                        <p className='label width_200 text_right'>2025-01-01</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}
