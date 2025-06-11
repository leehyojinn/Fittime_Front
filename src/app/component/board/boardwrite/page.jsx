'use client'

import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import { useAuthStore } from '@/app/zustand/store';

function BoardWriteContent() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const board_idx = searchParams.get('board_idx');
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fileInputRef = useRef(null);

    const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { noGuest: true });
    }, [checkAuthAndAlert, router]);

    useEffect(() => {
        if (board_idx != null) {
            getBoardDetail();
        }
    }, [board_idx]);

    const getBoardDetail = () => {
        axios
            .post(`${apiUrl}/detail/bbs/${board_idx}`)
            .then(({ data }) => {
                setTitle(data.dto.title);
                setContent(data.dto.content);
                if (data.photos?.length > 0) {
                    setFiles([]);
                    setPreviewUrls([]);
                    data.photos.forEach((photo) => {
                        axios
                            .get(`${apiUrl}/bbsImg/${photo.file_idx}`, { responseType: "blob" })
                            .then(({ data: blob }) => {
                                const file = new File([blob], `${photo.file_name}`, { type: blob.type });
                                setFiles(prev => [...prev, file]);
                                setPreviewUrls(prev => [
                                    ...prev,
                                    URL.createObjectURL(blob)
                                ]);
                            });
                    });
                }
            })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }
        formData.append('title', title);
        formData.append('content', content);
        if (board_idx != null) {
            formData.append('board_idx', board_idx);
            const { data } = await axios.post(`${apiUrl}/update/bbs`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                router.push(
                    `/component/board/boarddetail?category=${category}&board_idx=` + board_idx
                );
            }
        } else {
            formData.append('user_id', sessionStorage.getItem('user_id'));
            formData.append('category', category);
            const { data } = await axios.post(`${apiUrl}/write/bbs`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                router.push(
                    `/component/board/boarddetail?category=${category}&board_idx=` + data.board_idx
                );
            }
        }
        // setSubmitted(true); setTitle(''); setContent(''); setFiles([]);
    };

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

    // 파일 업로드
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).slice(0, 5);
        setFiles(newFiles);
        const urls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    // 파일 삭제
    const handleRemoveFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
        setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="board-write-bg">
            <Header />
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title'>게시글 {board_idx ? '수정' : '작성'}</p>
            </div>
            <div className="board-write-wrap">
                <h2 className="board-write-title">
                    게시글 {board_idx ? '수정' : '작성'}
                </h2>
                <form className="board-write-form" onSubmit={handleSubmit} autoComplete="off">
                    <div className="board-write-form-group">
                        <label htmlFor="board-title" className="board-write-label">제목</label>
                        <input
                            id="board-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="board-write-input"
                            placeholder="제목을 입력하세요"
                        />
                    </div>
                    <div className="board-write-form-group">
                        <label htmlFor="board-content" className="board-write-label">내용</label>
                        <textarea
                            id="board-content"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            className="board-write-textarea"
                            placeholder="내용을 입력하세요"
                        />
                    </div>
                    <div className="board-write-form-group">
                        <label className="board-write-label">이미지 첨부</label>
                        <div className="board-write-file-row">
                            <button
                                type="button"
                                className="board-write-file-btn"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FaCamera /> 파일 선택
                            </button>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="board-write-file-preview">
                            {previewUrls.map((url, i) => (
                                <div className="board-write-file-thumb" key={i}>
                                    <img src={url} alt={`첨부 이미지 ${i + 1}`} />
                                    <button type="button" className="board-write-file-remove" onClick={() => handleRemoveFile(i)}>×</button>
                                </div>
                            ))}
                            {files.length === 0 && (
                                <div className="board-write-file-empty">첨부된 이미지가 없습니다.</div>
                            )}
                        </div>
                    </div>
                    <div className="board-write-action-row">
                        <Link href={getLink()}>
                            <button type="button" className='btn white_color label'>
                                취소
                            </button>
                        </Link>
                        <button type="submit" className='btn white_color label'>
                            {board_idx ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default function BoardWrite(){
    return(
        <Suspense>
            <BoardWriteContent/>
        </Suspense>
    );
}