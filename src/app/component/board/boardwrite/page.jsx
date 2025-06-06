'use client'

import Footer from '@/app/Footer';
import Header from '@/app/Header';
import React, { useState, useEffect } from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {FaCamera} from "react-icons/fa";

export default function BoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState([]);

  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const board_idx = searchParams.get('board_idx');
  const router = useRouter();

    useEffect(() => {
        if(board_idx != null){
            console.log(board_idx);
            getBoardDetail();
        }
    }, [board_idx]);

    const getBoardDetail =  () => {
        axios.post(`http://localhost/detail/bbs/${board_idx}`)
            .then(({data}) => {
                console.log(data);
                setTitle(data.dto.title);
                setContent(data.dto.content);
                if(data.photos?.length>0) {
                    data.photos.map((photo)=>{
                        axios.get(`http://localhost/bbsImg/${photo.file_idx}`,{
                            responseType: "blob"
                        })
                            .then(({data})=>{
                                const file = new File([data], `${photo.file_name}`, { type: data.type });
                                console.log(file);
                                setFiles(prev => [...prev,file]);
                            })
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
    if(board_idx != null){
        formData.append('board_idx', board_idx);
        const {data} = await axios.post('http://localhost/update/bbs', formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        console.log('수정 : ',data);
        if(data.success) {
            router.push(`/component/board/boarddetail?category=${category}&board_idx=` + board_idx);
        }
    }else {
        formData.append('user_id', sessionStorage.getItem('user_id'));
        formData.append('category', category);
        const {data} = await axios.post('http://localhost/write/bbs', formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        console.log('등록 : ',data);
        if (data.success){
            router.push(`/component/board/boarddetail?category=${category}&board_idx=`+data.board_idx);
        }
    }
    // console.log('제목:', title);
    // console.log('내용(HTML):', content); // HTML 형식 콘텐츠 확인 가능
    // setSubmitted(true);
    // setTitle('');
    // setContent('');
    // setFiles([]);
  };



  // 취소 링크 주소
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

  // 파일 업로드
    const handleFileChange = (e) => {
        const newFiles = Array
            .from(e.target.files)
            .slice(0, 5);
        setFiles(newFiles);
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
              <textarea onChange={e=> setContent(e.target.value)} value={content}></textarea>
            </div>

            <div>
              <input type="file"
                     name=""
                     id=""
                     accept="image/jpeg,image/png"
                     multiple
                     onChange={handleFileChange}
                     style={{padding:'10px 20px',height:60,boxSizing:'border-box',border:'none'}}/>
            </div>
              <div className="review-file-preview">
                  {
                      files
                          ?.map((file, i) => (<span key={i} className="file-name">{file instanceof File? file.name : file}</span>))
                  }
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
            <Link href={getLink()}>
                <button
                  type="button"
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
            </Link>
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
