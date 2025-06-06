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
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [update_idx, setUpdate_idx] = useState(null);
    const [replyState, setReplyState] = useState(false);
    const [commentIdx, setCommentIdx] = useState(null);
    const [replys, setReplys] = useState([]);

    useEffect(() => {
        getBoardDetail();
        getComment();
        getReplys();
    }, []);

    const getBoardDetail = async () => {
        const {data} = await axios.post(`http://localhost/detail/bbs/${board_idx}`);
        console.log(data);
        setBoard(data.dto);
        setFiles(data.photos);
    }

    const getComment = async () => {
        const {data} = await axios.post(`http://localhost/list/comment/${board_idx}`);
        console.log(data);
        setComments(data.comments);
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

    const writeComment = async () =>{
        if(update_idx != null){
            const {data} = await axios.post('http://localhost/update/comment',{content:text, comment_idx:update_idx});
            console.log('수정 : ',data);
            if (data.success) {
                setUpdate_idx(null);
                setText('');
                getComment();
            }
        }else {
            const {data} = await axios.post('http://localhost/write/comment', {
                user_id: sessionStorage.getItem('user_id'),
                content: text,
                board_idx: board_idx
            });
            console.log('등록 : ',data);
            if (data.success) {
                setText('');
                getComment();
            }
        }
    }

    const writeReply = async () =>{
        if(update_idx != null){
            const {data} = await axios.post('http://localhost/update/reply',{content: text, reply_idx:update_idx});
            console.log('수정 : ',data);
            if (data.success) {
                setUpdate_idx(null);
                setReplyState(false);
                setText('');
                getReplys();
            }
        } else {
            const {data} = await axios.post('http://localhost/write/reply', {content: text, comment_idx:commentIdx, user_id: sessionStorage.getItem('user_id')});
            console.log('등록 : ',data);
            if (data.success) {
                setText('');
                setReplyState(false);
                getReplys();
            }
        }

    }

    const getReplys = async () => {
        const {data} = await axios.post(`http://localhost/list/reply/${board_idx}`);
        console.log(data);
        setReplys(data.reply);
    }

    const changeUpdateComment = (comment) =>{
        setReplyState(()=>{
            setUpdate_idx(prev => {
                setText(prev === comment.idx ? '' : comment.content);
                return (prev === comment.idx ? null : comment.idx);
            });
            return false;
        })

    }

    const delComment = async (idx) =>{
        const {data} = await axios.post(`http://localhost/del/comment/${idx}`);
        console.log(data);
        if(data.success){
            getComment();
        }
    }

    const changeReply = async (comment_idx) =>{
        setReplyState((prev)=>{
            setCommentIdx(comment_idx);
            return!prev
        })
    }

    const changeUpdateReply = (reply) => {
        setReplyState((prev)=>{
            setUpdate_idx((prev) => {
                setText(prev === reply.reply_idx ? '' : reply.content);
                return (prev === reply.reply_idx ? null : reply.reply_idx);
            });
            return !prev;
        })
    }

    const delReply = async(reply_idx) =>{
        const {data} = await axios.post(`http://localhost/del/reply/${reply_idx}`);
        console.log(data);
        if(data.success){
            getReplys();
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
                {comments && comments?.length > 0 && comments?.map((comment, index) => (<>
                    <p className='flex justify_con_space_between gap_20' key={comment.comment_idx}>{comment.content}
                        <span className='ml_auto'>{comment.user_id}</span> <span>{comment.reg_date.substring(0,10)}</span>{board.user_id === sessionStorage.getItem('user_id') ? <span className="pointer" onClick={()=>changeReply(comment.comment_idx)}>대댓글</span>:''}{comment.user_id === sessionStorage.getItem('user_id') ? <><span className="pointer" onClick={()=>changeUpdateComment(comment)}>{update_idx===comment.comment_idx ? '취소':'수정'}</span><span className="pointer" onClick={()=>delComment(comment.comment_idx)}>삭제</span></>:''}</p>
                    {replys.filter(reply=>reply.comment_idx === comment.comment_idx)?.map(reply => (
                        <p className='flex justify_con_space_between gap_20'>ㄴ {reply.content} <span className='ml_auto'>{reply.user_id}</span> <span>{reply.reg_date.substring(2,10)}</span>{reply.user_id === sessionStorage.getItem('user_id') ? <><span className="pointer" onClick={()=>changeUpdateReply(reply)}>{update_idx===reply.reply_idx ? '취소':'수정'}</span><span className="pointer" onClick={()=>delReply(reply.reply_idx)}>삭제</span></> : '' }</p>
                    ))}
                    </>
                ))}
            </div>
                <div style={{fontSize:'15px', fontWeight:'bold'}}> {replyState ? '대댓글' : '댓글' }</div>
            <div className='flex gap_10'>
                <textarea name="" id="" style={{height:200}} value={text} onChange={e=>setText(e.target.value)}></textarea>
                {replyState ?
                    <button className='btn white_color label' onClick={writeReply}>{update_idx !== null ? '수정' : '등록'}</button> :
                    <button className='btn white_color label' onClick={writeComment}>{update_idx !== null ? '수정' : '등록'}</button>
                }
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
