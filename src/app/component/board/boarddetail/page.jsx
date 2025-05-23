import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React from 'react';

export default function BoardDetail() {
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
            <h1 className="middle_title">{post.title}</h1>
            {/* 작성자, 날짜, 조회수 */}
            <div className="flex gap_10">
                <span className='label'>작성자: {post.author}</span>
                <span className='label'>{post.date}</span>
            </div>
            {/* 본문 */}
            <div style={{padding:20, border:'1px solid #ccc'}}>

                <div className="content_text">
                    {post.content}
                </div>
                {/* 첨부파일 */}
                {post.attachments.length > 0 && (
                    <div className="flex column gap_10">
                    <img src="/id1.png" alt="" style={{width:300,margin:'0 auto'}}/>
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
                <button className="btn label white_color">
                목록
                </button>
                <button className="btn label white_color">
                수정
                </button>
                <button className="btn label white_color">
                삭제
                </button>
            </div>
            </div>
        </div>
        <Footer/>
    </div>
    );
}
