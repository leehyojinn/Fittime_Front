'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import axios from 'axios';
import Header from '../../Header';
import Footer from '../../Footer';
import {useRouter, useSearchParams} from "next/navigation";
import { useAuthStore } from '@/app/zustand/store';

const ComplaintForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [selectedImages, setSelectedImages] = useState([]);
  const [complaintList, setComplaintList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState(null); // 클릭된 신고번호

  const searchParams = useSearchParams();
  const review_idx = searchParams.get('review_idx');
  const report_id = searchParams.get('report_id');
  const target_id = searchParams.get('target_id');

  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  useEffect(() => {
    checkAuthAndAlert(router, null, { minLevel: 3 });
  }, [checkAuthAndAlert, router]);

  const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.');
      return;
    }
    if (files.some(file => file.size > 10 * 1024 * 1024)) {
      alert('각 이미지는 10MB 이하여야 합니다.');
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(newImages);
  };

  // 신고 등록
  const handleComplaintSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const complaintData = {
        report_id: data.report_id,
        // admin_id: data.admin_id,
        reason: data.reason,
        report_text: data.report_text,
        review_idx: Number(data.review_idx)
      };
      formData.append('complaint', new Blob([JSON.stringify(complaintData)], { type: 'application/json' }));
      selectedImages.forEach(img => {
        formData.append('files', img.file);
      });

      const response = await axios.post(
        'http://localhost/complaint',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data && response.data.success) {
        alert('신고가 정상적으로 접수되었습니다.');
        setSelectedImages([]);
        reset();
        getComplaintList();
      } else {
        alert('신고 접수에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('신고 접수 중 오류가 발생했습니다.');
    }
    setLoading(false);
    getComplaintList();
  };

  // 신고내역 불러오기
  const getComplaintList = async () => {
    try {
      const { data } = await axios.post(`http://localhost/complaint_list/${user_id}`);
      setComplaintList(data.list || []);
      console.log(data.list);
    } catch (err) {
      console.error(err);
      setComplaintList([]);
    }
  };

  useEffect(() => {
    getComplaintList();
    // eslint-disable-next-line
  }, []);

  const reasons = [
    '불법 광고 게시',
    '욕설/비방',
    '성적으로 부적절한 내용',
    '개인정보 침해',
    '서비스 이용방해',
    '예약 노쇼',
    '기타'
  ];

  // 날짜 포맷 함수 (YYYY-MM-DD HH:mm:ss → YYYY.MM.DD HH:mm)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // MySQL DATETIME("YYYY-MM-DD HH:mm:ss") → JS Date 변환
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date)) return '-';
    // "2025.05.20 13:30" 형식
    return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  // 신고내역 클릭 핸들러
  const handleComplaintClick = (report_idx) => {
    setOpenIdx(openIdx === report_idx ? null : report_idx);
  };

  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>신고하기 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="complaint-form-container">
          <h2 className="middle_title2">신고하기</h2>
          <div className="form-section">
            {/* 신고사유,신고내용 제외하고 자동입력 수정방지 하기*/}
            <form onSubmit={handleSubmit(handleComplaintSubmit)}>
              <div className="form-group">
                <label htmlFor="review_idx" className='label font_weight_500'>리뷰 번호 (review_idx)</label>
                <input
                  id="review_idx"
                  type="number"
                  {...register("review_idx", { required: "리뷰 번호를 입력해주세요" })}
                  placeholder="연결할 리뷰 번호"
                  value={review_idx}
                />
                {errors.review_idx && <span className="error-message">{errors.review_idx.message}</span>}
              </div>
              {/*<div className="form-group">*/}
              {/*  <label htmlFor="admin_id" className='label font_weight_500'>관리자아이디 (admin_id)</label>*/}
              {/*  <input*/}
              {/*    id="admin_id"*/}
              {/*    type="text"*/}
              {/*    {...register("admin_id", { required: "admin 아이디를 입력해주세요" })}*/}
              {/*    placeholder="admin 아이디"*/}
              {/*  />*/}
              {/*  {errors.admin_id && <span className="error-message">{errors.admin_id.message}</span>}*/}
              {/*</div>*/}
              <div className="form-group">
                <label htmlFor="report_id" className='label font_weight_500'>신고자 아이디</label>
                <input
                  id="report_id"
                  type="text"
                  {...register("report_id", { required: "신고 대상의 아이디를 입력해주세요" })}
                  placeholder="신고할 회원의 아이디"
                  value={report_id}
                />
                {errors.report_id && <span className="error-message">{errors.report_id.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="reason" className='label font_weight_500'>신고 사유</label>
                <select
                  id="reason"
                  {...register("reason", { required: "신고 사유를 선택해주세요" })}
                  style={{width:'100%'}}
                >
                  <option value="">신고 사유 선택</option>
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
                {errors.reason && <span className="error-message">{errors.reason.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="report_text" className='label font_weight_500'>신고 내용</label>
                <textarea
                  id="report_text"
                  {...register("report_text", {
                    required: "신고 내용을 입력해주세요",
                    minLength: { value: 10, message: "최소 10자 이상 입력해주세요" }
                  })}
                  className="form-control"
                  rows={5}
                  placeholder="구체적인 신고 내용을 입력해주세요"
                />
                {errors.report_text && <span className="error-message">{errors.report_text.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="images">증빙 자료 (최대 5장, 각 10MB 이하)</label>
                <input
                  id="images"
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleImageChange}
                  multiple
                  style={{margin:'5px 0'}}
                />
                <p className="help-text">지원 형식: JPEG, PNG (최대 5장)</p>
              </div>
              {selectedImages.length > 0 && (
                <div className="image-previews">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="image-preview-container">
                      <Image
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="image-preview"
                      />
                    </div>
                  ))}
                </div>
              )}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? '접수 중...' : '신고 접수'}
              </button>
            </form>
          </div>
          <div className="submitted-complaints">
            <h3 className='middle_title2 mb_20'>신고 내역</h3>
            {complaintList.length === 0 ? (
              <p className="no-data">접수된 신고 내역이 없습니다.</p>
            ) : (
              <div>
                {complaintList.map((complaint) => (
                  <div
                    key={complaint.report_idx}
                    className="complaint-item"
                    style={{
                      marginBottom: 32,
                      cursor: 'pointer',
                      border: openIdx === complaint.report_idx ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: 8,
                      padding: 12,
                      background: openIdx === complaint.report_idx ? '#f6faff' : '#fff'
                    }}
                    onClick={() => handleComplaintClick(complaint.report_idx)}
                  >
                    <table className="complaints-table" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th className='label font_weight_500'>신고번호</th>
                          <th className='label font_weight_500'>신고대상</th>
                          <th className='label font_weight_500'>신고사유</th>
                          <th className='label font_weight_500'>접수일시</th>
                          <th className='label font_weight_500'>처리상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='label font_weight_400'>{complaint.report_idx}</td>
                          <td className='label font_weight_400'>{complaint.report_id}</td>
                          <td className='label font_weight_400'>{complaint.reason}</td>
                          <td className='label font_weight_400'>{formatDate(complaint.submitted_at || complaint.reg_date)}</td>
                          <td>
                            <span className={`status ${complaint.status?.replace(/\s+/g, '')}`}>
                              {complaint.status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* 클릭된 신고만 이미지 아래에 노출 */}
                    {openIdx === complaint.report_idx && complaint.images && complaint.images.length > 0 && (
                      <div className="complaint-images"
                        style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '5px' }}>
                        {complaint.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={`http://localhost/complaint/${img}`}
                            alt={`증빙이미지${idx + 1}`}
                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ComplaintForm;
