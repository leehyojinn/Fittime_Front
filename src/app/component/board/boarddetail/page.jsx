'use client'
import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useAuthStore } from '@/app/zustand/store';

function BoardDetailContent() {
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { noGuest: true });
    }, [checkAuthAndAlert, router]);

    useEffect(() => {
        getBoardDetail();
        getComment();
        getReplys();
    }, []);

    const getBoardDetail = async () => {
        const { data } = await axios.post(`${apiUrl}/detail/bbs/${board_idx}`);
        setBoard(data.dto);
        setFiles(data.photos);
    }

    const getComment = async () => {
        const { data } = await axios.post(`${apiUrl}/list/comment/${board_idx}`);
        setComments(data.comments);
    }

    const getLink = () => {
        switch (category) {
            case '이벤트':
                return '/component/board/event';
            case '건의사항':
                return '/component/board/suggestions';
            case 'QnA':
                return '/component/board/qna';
            default:
                return '/component/board';
        }
    }

    const updateBoard = () => {
        router.push(`/component/board/boardwrite?category=${category}&board_idx=${board_idx}`);
    }

    const delBoard = async () => {
        const { data } = await axios.post(`${apiUrl}/del/bbs/${board_idx}`);
        if (data.success) {
            router.push(getLink());
        }
    }

    const writeComment = async () => {
        if (update_idx != null) {
            const { data } = await axios.post(`${apiUrl}/update/comment`, { content: text, comment_idx: update_idx });
            if (data.success) {
                setUpdate_idx(null);
                setText('');
                getComment();
            }
        } else {
            const { data } = await axios.post(`${apiUrl}/write/comment`, {
                user_id: sessionStorage.getItem('user_id'),
                content: text,
                board_idx: board_idx
            });
            if (data.success) {
                setText('');
                getComment();
            }
        }
    }

    const writeReply = async () => {
        if (update_idx != null) {
            const { data } = await axios.post(`${apiUrl}/update/reply`, { content: text, reply_idx: update_idx });
            if (data.success) {
                setUpdate_idx(null);
                setReplyState(false);
                setText('');
                getReplys();
            }
        } else {
            const { data } = await axios.post(`${apiUrl}/write/reply`, { content: text, comment_idx: commentIdx, user_id: sessionStorage.getItem('user_id') });
            if (data.success) {
                setText('');
                setReplyState(false);
                getReplys();
            }
        }
    }

    const getReplys = async () => {
        const { data } = await axios.post(`${apiUrl}/list/reply/${board_idx}`);
        setReplys(data.reply);
    }

    const changeUpdateComment = (comment) => {
        setReplyState(() => {
            setUpdate_idx(prev => {
                setText(prev === comment.comment_idx ? '' : comment.content);
                return (prev === comment.comment_idx ? null : comment.comment_idx);
            });
            return false;
        })
    }

    const delComment = async (idx) => {
        const { data } = await axios.post(`${apiUrl}/del/comment/${idx}`);
        if (data.success) {
            getComment();
        }
    }

    const changeReply = async (comment_idx) => {
        setReplyState((prev) => {
            setCommentIdx(comment_idx);
            return !prev
        })
    }

    const changeUpdateReply = (reply) => {
        setReplyState((prev) => {
            setUpdate_idx((prev) => {
                setText(prev === reply.reply_idx ? '' : reply.content);
                return (prev === reply.reply_idx ? null : reply.reply_idx);
            });
            return !prev;
        })
    }

    const delReply = async (reply_idx) => {
        const { data } = await axios.post(`${apiUrl}/del/reply/${reply_idx}`);
        if (data.success) {
            getReplys();
        }
    }

    return (
        <div className="board-detail-bg">
            <Header />
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title'>게시글 상세보기</p>
            </div>
            <div className="board-detail-wrap">
                <section className="board-detail-card">
                    <h1 className="board-detail-title">
                        <p className='mb_20'>제목</p>
                        {board.title}
                    </h1>
                    <div className="board-detail-meta justify_con_space_between">
                        <span>작성자: {board.user_id}</span>
                        <span>{board.reg_date}</span>
                    </div>
                    <div className="board-detail-content">
                        <div className="board-detail-text">
                            <p className='mb_20'>내용</p>
                                {board.content}
                        </div>
                        {files && files.length > 0 && (
                            <div className="board-detail-files justify_con_center">
                                {files.map((file) => (
                                    <img
                                        key={file.file_idx}
                                        src={`${apiUrl}/bbsImg/${file.file_idx}`}
                                        alt="첨부 이미지"
                                        className="board-detail-image"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="board-detail-comments">
                    <h2 className="board-detail-comment-title">댓글</h2>
                    <ul className="board-detail-comment-list">
                        {comments && comments.length > 0 && comments.map((comment) => (
                            <li className="board-detail-comment-item" key={comment.comment_idx}>
                                <div className="board-detail-comment-main">
                                    <span className="board-detail-comment-content">{comment.content}</span>
                                    <span className="board-detail-comment-user">{comment.user_id}</span>
                                    <span className="board-detail-comment-date">{comment.reg_date?.substring(0, 10)}</span>
                                    {board.user_id === sessionStorage.getItem('user_id') &&
                                        <span className="board-detail-comment-action" onClick={() => changeReply(comment.comment_idx)}>대댓글</span>
                                    }
                                    {comment.user_id === sessionStorage.getItem('user_id') &&
                                        <>
                                            <span className="board-detail-comment-action" onClick={() => changeUpdateComment(comment)}>{update_idx === comment.comment_idx ? '취소' : '수정'}</span>
                                            <span className="board-detail-comment-action" onClick={() => delComment(comment.comment_idx)}>삭제</span>
                                        </>
                                    }
                                </div>
                                <ul className="board-detail-reply-list">
                                    {replys.filter(reply => reply.comment_idx === comment.comment_idx).map(reply => (
                                        <li className="board-detail-reply-item" key={reply.reply_idx}>
                                            <span className="board-detail-reply-content">ㄴ {reply.content}</span>
                                            <span className="board-detail-reply-user">{reply.user_id}</span>
                                            <span className="board-detail-reply-date">{reply.reg_date?.substring(2, 10)}</span>
                                            {reply.user_id === sessionStorage.getItem('user_id') &&
                                                <>
                                                    <span className="board-detail-comment-action" onClick={() => changeUpdateReply(reply)}>{update_idx === reply.reply_idx ? '취소' : '수정'}</span>
                                                    <span className="board-detail-comment-action" onClick={() => delReply(reply.reply_idx)}>삭제</span>
                                                </>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <div className="board-detail-comment-form-label">{replyState ? '대댓글' : '댓글'}</div>
                    <div className="board-detail-comment-form">
                        <textarea
                            className="board-detail-comment-input"
                            style={{height:90,resize:'none',fontSize:'1.5rem'}}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="댓글을 입력하세요"
                        />
                        {replyState ?
                            <button className='btn white_color label' onClick={writeReply}>{update_idx !== null ? '수정' : '등록'}</button> :
                            <button className='btn white_color label' onClick={writeComment}>{update_idx !== null ? '수정' : '등록'}</button>
                        }
                    </div>
                </section>

                <div className="flex justify-end gap_10 board-detail-action-row">
                    <Link href={getLink()}>
                        <button className="btn label white_color">
                            목록
                        </button>
                    </Link>
                    {sessionStorage.getItem('user_id') === board.user_id &&
                        <>
                            <button className="btn label white_color" onClick={updateBoard}>
                                수정
                            </button>
                            <button className="btn label white_color" onClick={delBoard}>
                                삭제
                            </button>
                        </>
                    }
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function BoardDetail(){
    return(
        <Suspense>
            <BoardDetailContent/>
        </Suspense>
    );
}