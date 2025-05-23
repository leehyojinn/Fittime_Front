'use client'

import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React, { useState, useEffect } from 'react';

export default function BoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('제목:', title);
    console.log('내용(HTML):', content); // HTML 형식 콘텐츠 확인 가능
    setSubmitted(true);
    setTitle('');
  };

  return (
    <div>
      <Header/>
      <div className='wrap padding_120_0'>
        <div>
          <h2 style={{ fontSize: 28, marginBottom: 30 }}>게시글 작성</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 16 }}>제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 16,
                  border: '1px solid #ddd',
                  borderRadius: 6
                }}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 16 }}>내용</label>
              <textarea></textarea>
            </div>

            <div>
              <input type="file" name="" id="" style={{padding:'10px 20px',height:60,boxSizing:'border-box',border:'none'}}/>
            </div>

            <button
              type="submit"
              style={{
                background: '#007bff',
                color: '#fff',
                padding: '12px 30px',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                cursor: 'pointer',
                float: 'right'
              }}
            >
              등록하기
            </button>
            <button
              type="submit"
              style={{
                background: '#007bff',
                color: '#fff',
                padding: '12px 30px',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                cursor: 'pointer',
                float: 'right',
                marginRight:5
              }}
            >
              취소
            </button>
          </form>

          {submitted && (
            <div style={{ 
              marginTop: 24, 
              padding: 16,
              background: '#f0f9ff',
              borderRadius: 6,
              color: '#0369a1'
            }}>
              게시글이 성공적으로 등록되었습니다!
            </div>
          )}
        </div>
      </div>
      <Footer/>

      {/* SunEditor CSS 추가 */}
      <link 
        href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" 
        rel="stylesheet"
      />
    </div>
  );
}
