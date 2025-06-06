'use client'
import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React, {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function BoardDetail() {

    const searchParams = useSearchParams();
    const board_idx = searchParams.get('board_idx');
    const category = searchParams.get('category');
    const router = useRouter();
    const [board, setBoard] = useState({});
    const [files, setFiles] = useState([]);

    useEffect(() => {
        getBoardDetail();
    }, []);

    const getBoardDetail = async () => {
        const {data} = await axios.post(`http://localhost/detail/bbs/${board_idx}`);
        console.log(data);
        setBoard(data.dto);
        setFiles(data.photos);
    }

    const getLink = () => {
        switch (category) {
            case '이벤트' :
                return '/component/board/event';
            case '건의사항' :
                return '/component/board/suggestions';
            case 'QnA' :
                return '/component/board/qna';
            default:
                return '/component/board';
        }
    }

    const updateBoard = () => {
        router.push(`/component/board/boardwrite?category=${category}&board_idx=${board_idx}`);
    }

    const delBoard = async () => {
        const {data} = await axios.post(`http://localhost/del/bbs/${board_idx}`);
        console.log(data);
        if(data.success){
            router.push(getLink());
        }
    }

  // 예시 데이터 (실제 사용시 props나 fetch로 대체)
const post = {
    title: '상세페이지 제목',
    author: '홍길동',
    date: '2025-05-14',
    views: 123,
    content: `이곳은 게시판 글 상세 내용입니다.`,
    attachments: [
        {
            name: '첨부파일.pdf',
            url: '#'
        }, {
            name: '이미지.png',
            url: '#'
        }
    ]
};



    return (
    <div>
        <Header/>
        <div className='wrap padding_120_0'>

            <div className="flex column gap_20">
            {/* 제목 */}
            <h1 className="middle_title">{board.title}</h1>
            {/* 작성자, 날짜, 조회수 */}
            <div className="flex gap_10">
                <span className='label'>작성자: {board.user_id}</span>
                <span className='label'>{board.reg_date}</span>
            </div>
            {/* 본문 */}
            <div style={{padding:20, border:'1px solid #ccc'}}>

                <div className="content_text">
                    {board.content}
                </div>
                {/* 첨부파일 */}
                {files && files?.length > 0 && (
                    <div className="flex gap_10">
                        {files.map((file, idx) => (
                            <img key={file.file_idx} src={`http://localhost/bbsImg/${file.file_idx}`} alt="" style={{width:300,margin:'0 auto'}}/>
                        ))
                        }
                    </div>
                )}
            </div>
            <div className='flex column text-left gap_10'>
                <p className='flex justify_con_space_between gap_20'>댓글입니다. <span className='ml_auto'>아이디 : admin 1</span> <span>2025-01-01</span> <span>수정</span><span>대댓글</span><span>삭제</span></p>
                <p className='flex justify_con_space_between gap_20'>ㄴ 대댓글입니다. <span className='ml_auto'>아이디 : admin 11</span> <span>2025-01-01</span> <span>수정</span><span>삭제</span></p>
                <p className='flex justify_con_space_between gap_20'>댓글입니다. <span className='ml_auto'>아이디 : admin 2</span> <span>2025-01-01</span> <span>수정</span><span>대댓글</span><span>삭제</span></p>
                <p className='flex justify_con_space_between gap_20'>댓글입니다. <span className='ml_auto'>아이디 : admin 3</span> <span>2025-01-01</span> <span>수정</span><span>대댓글</span><span>삭제</span></p>

            </div>
            <div className='flex gap_10'>
                <textarea name="" id="" style={{height:200}}></textarea> 
                <button className='btn white_color label'>등록</button>
            </div>
            {/* 버튼 */}
            <div className="flex justify-end gap_10">
                <Link href={getLink()}>
                    <button className="btn label white_color">
                        목록
                    </button>
                </Link>
                {sessionStorage.getItem('user_id') === board.user_id ?
                    <>
                    <button className="btn label white_color" onClick={updateBoard}>
                        수정
                    </button>
                    <button className="btn label white_color" onClick={delBoard}>
                    삭제
                    </button>
                    </>
                : ''
                }
            </div>
            </div>
        </div>
        <Footer/>
    </div>
    );
}
