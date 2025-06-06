'use client'

import React, {useEffect, useState} from 'react'
import Footer from '../../Footer'
import Header from '../../Header'
import BoardWrite from './boardwrite/page'
import Link from 'next/link'
import axios from "axios";
import {useRouter} from "next/navigation";

export default function Event() {

    const [list, setList] = useState([]);
    const [myList, setMyList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [filter, setFilter] = useState(false);
    const [myTotalPage, setMyTotalPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        getboard();
        getMyList();
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    const getboard = async () => {
        const {data} = await axios.post('http://localhost/list/bbs',{category:'이벤트',page:page})
        console.log(data);
        setList(data.list);
        setTotalPage(data.totalpage);
    }

    const getMyList = async() => {
        const {data} = await axios.post('http://localhost/list/bbs',{category:'이벤트',page:page,user_id:sessionStorage.getItem('user_id')})
        console.log(data);
        setMyList(data.list);
        setMyTotalPage(data.totalpage);
    }

    const MoveBoardWrite = () => {
        router.push('/component/board/boardwrite?category=이벤트');
    }

    const MoveBoardDetail = (board_idx) =>{
        router.push('/component/board/boarddetail?category=이벤트&board_idx='+board_idx);
    }

    const filteredList = filter ? myList : list ;
    const filteredTotal = filter ? myTotalPage : totalPage;

    return (
        <div>
            <Header/>
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title'>이벤트 게시판</p>
            </div>
            <div className='wrap padding_120_0'>
                <div className='flex justify_con_between'>
                    <div className='btn label white_color' style={{width:'auto'}} onClick={()=>setFilter((prev)=>!prev)}>{filter ? '전체 글 보기':'내 글만 보기'}</div>
                    <div className='btn label white_color' style={{width:'auto'}} onClick={MoveBoardWrite}>글쓰기</div>
                </div>
                <div className='mt_20'>
                    <div className='flex justify_con_space_between gap_10 board_css'>
                        <p className='content_text width_200 text_left'>번호</p>
                        <p className='content_text flex_1'>제목</p>
                        <p className='content_text width_200'>아이디</p>
                        <p className='content_text width_200 text_right'>날짜</p>
                    </div>
                    {/* 확인용 데이터 링크걸기*/}
                    {filteredList && page <= filteredTotal && (
                        filteredList.map((l, idx) => (
                            <div key={idx} className='flex justify_con_space_between gap_10 board_css board_content' onClick={()=>MoveBoardDetail(l.board_idx)}>
                                <p className='label width_200 text_left'>{idx+1+(page-1)*10}</p>
                                <p className='label flex_1'>{l.title}</p>
                                <p className='label width_200'>{l.user_id}</p>
                                <p className='label width_200 text_right'>{l.reg_date.substring(0,10)}</p>
                            </div>
                        ))
                    )}
                </div>
                <div style={{display:'flex'}}>
                    <div className="pagination-buttons-fixed">
                        {
                            page > 1 && (
                                <div>
                                    <button
                                        type="button"
                                        className="review-submit-btn-n"
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                                        이전 페이지
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    <div style={{ justifyContent: 'flex-end' ,display:'flex'}}>
                        {
                            list &&  page < filteredTotal && (
                                <button
                                    className="review-submit-btn-n"
                                    onClick={() => setPage(prev => prev + 1)}
                                > 다음 페이지
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}
