'use client'

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';
import { useAlertModalStore } from '@/app/zustand/store';
import AlertModal from '../alertmodal/page';
import BlackList from "@/app/BlackList";

const BlacklistManagement = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [openComplaint, setOpenComplaint] = useState(false);
  const [openBlackList, setOpenBlackList] = useState(false);

  const {openModal} = useAlertModalStore();

  const getComplaints = async () => {
    try {
      const { data } = await axios.post('http://localhost/blacklist_list');
      console.log(data);
      // 콘솔로 실제 응답 구조 확인
      // 배열만 반환되면
      if (Array.isArray(data)) setComplaints(data);
      // { list: [...] } 구조면
      else if (Array.isArray(data.list)) setComplaints(data.list);
      // { complaints: [...] } 구조면
      else if (Array.isArray(data.complaints)) setComplaints(data.complaints);
      else setComplaints([]);
    } catch (err) {
      console.error(err);
      setComplaints([]);
    }
  };
  
  useEffect(() => {
    getComplaints();
  }, []);

  // 상세보기 클릭시 상세 정보 세팅
  const handleViewDetails = (complaint) => {
    setOpenComplaint(true);
    setSelectedComplaint(complaint);
    // 폼에 현재 상태/처리내용 세팅
    setValue('status', complaint.status || '미확인');
    setValue('process_history', complaint.process_history || '');
  };

  // 처리 내용/상태 저장
  const handleProcessComplaint = async (data) => {
    if (!selectedComplaint) return;
    setLoading(true);
    try {
      // 상태/처리내용 업데이트
      const res = await axios.post(
        `http://localhost/blacklist_status/${selectedComplaint.report_idx}`,
        { status: data.status, process_history: data.process_history, admin_id: sessionStorage.getItem('user_id') }
      );
      console.log(data.process_history);
      if (res.data && res.data.success) {
        openModal({
          svg: '✔',
          msg1 : '확인',
          msg2 : '처리 내용이 저장되었습니다.',
          showCancel : false,
        })
        getComplaints();
        // 상세도 갱신
        setSelectedComplaint({
          ...selectedComplaint,
          status: data.status,
          process_history: data.process_history
        });
      } else {
        openModal({
          svg: '❗',
          msg1 : '오류',
          msg2 : '처리 내용 저장에 실패하였습니다.',
          showCancel : false,
        })
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1 : '오류',
        msg2 : '처리 내용 저장 중 오류가 발생하였습니다.',
        showCancel : false,
      })
    }
    setLoading(false);
  };

  const alertBlacklist = () => {
    openModal({
      svg: '✔',
      msg1 : '확인',
      msg2 : '정말 블랙리스트 처리를 진행하시겠습니까?',
      showCancel : true,
      onConfirm : () => handleBlacklist(),
      onCancel: () => {},
    })
  }

  // 블랙리스트 등록(레벨 0)
  const handleBlacklist = async () => {
    if (!selectedComplaint) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost/blacklist_level/${selectedComplaint.report_id}`,{report_idx:selectedComplaint.report_idx}
      );
      if (res.data && res.data.success) {
        openModal({
          svg: '✔',
          msg1 : '확인',
          msg2 : '블랙리스트 처리가 완료되었습니다.',
          showCancel : false,
        })
        getComplaints();
        setSelectedComplaint({
          ...selectedComplaint,
          status: '처리완료'
        });
      } else {
        openModal({
          svg: '❗',
          msg1 : '오류',
          msg2 : '블랙리스트 처리 실패하였습니다.',
          showCancel : false,
        })
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1 : '오류',
        msg2 : '블랙리스트 처리 중 오류가 발생하였습니다.',
        showCancel : false,
      })
    }
    setLoading(false);
  };

  // 날짜 포맷 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date)) return '-';
    return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  // blackList 닫기
  const CloseBlackList = () =>{
    setOpenBlackList(false);
  }

  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>블랙리스트</p>
      </div>
      <div className="wrap padding_120_0">
        <div className="blacklist-container">
          <h2 className="middle_title2 mb_20">블랙리스트 관리</h2>
          <div className="complaints-filter">
            <div className="filter-group">
              <label className='label'>상태 필터 :</label>
              <select 
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
                style={{width:300}}
              >
                <option value="all">전체</option>
                <option value="미확인">미확인</option>
                <option value="처리중">처리중</option>
                <option value="처리완료">처리완료</option>
              </select>
            </div>
            <div className="search-group">
              <label className='label'>아이디 검색 : </label>
              <input 
                type="text"
                value={searchTerm}
                className='flex_1'
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="사용자 또는 신고자 아이디"
              />
            </div>
          </div>
          <div className="complaints-section">
            <h3 className='middle_title2 mb_20'>신고 목록</h3>
            <table className="complaints-table">
              <thead>
                <tr>
                  <th className='label font_weight_500'>신고번호</th>
                  <th className='label font_weight_500'>신고대상</th>
                  <th className='label font_weight_500'>신고자</th>
                  <th className='label font_weight_500'>상태</th>
                  <th className='label font_weight_500'>관리</th>
                </tr>
              </thead>
              <tbody>
                {complaints
                  .filter(c => filteredStatus === 'all' || c.status === filteredStatus)
                  .filter(c => c.report_id?.includes(searchTerm) || c.target_id?.includes(searchTerm))
                  .map((complaint) => (
                  <tr key={complaint.report_idx}>
                    <td className='label font_weight_400'>{complaint.report_idx}</td>
                    <td className='label font_weight_400'>{complaint.target_id}</td>
                    <td className='label font_weight_400'>{complaint.report_id}</td>
                    <td className='label font_weight_400'>
                      <span className={`status ${complaint.status}`} style={{fontSize:'13px'}}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleViewDetails(complaint)} className="btn label white_color">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {openComplaint && selectedComplaint && (
            <div className="complaint-details" style={{ marginTop: 32, border: '1px solid #eee', borderRadius: 8, padding: 20 }}>
              <h3 className='middle_title2'>신고 상세</h3>
              <div className="details-container">
                <div className="detail-item"><label className='label'>신고번호 : </label> <span className='label text_left'>{selectedComplaint.report_idx}</span></div>
                <div className="detail-item"><label className='label'>신고대상:</label> <span className='label text_left'>{selectedComplaint.target_id}</span></div>
                <div className="detail-item"><label className='label'>신고자:</label> <span className='label text_left'>{selectedComplaint.report_id}</span></div>
                <div className="detail-item"><label className='label'>신고내용:</label> <p className='label text_left'>{selectedComplaint.report_text}</p></div>
                <div className="detail-item"><label className='label'>접수일시:</label> <span className='label text_left'>{formatDate(selectedComplaint.submitted_at || selectedComplaint.reg_date)}</span></div>
                {/* 이미지 노출 */}
                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                  <div className="complaint-images"
                    style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
                    {selectedComplaint.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost/complaint/${img}`}
                        alt={`증빙이미지${idx + 1}`}
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                      />
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit(handleProcessComplaint)}>
                  <div className="detail-item" style={{fontSize:'15px', fontWeight:'bold',display:'block'}}>처리 history</div>
                  <div className="detail-item">
                    <textarea
                      {...register("process_history")}
                      defaultValue={selectedComplaint?.process_history || ''}
                      style={{lineHeight:1.3}}>
                    </textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status" className='middle_title2 mb_20'>처리 상태</label>
                    <select 
                      id="status"
                      {...register("status")}
                      style={{width:"100%"}}
                    >
                      <option value="미확인">미확인</option>
                      <option value="처리중">처리중</option>
                      <option value="처리완료">처리완료</option>
                    </select>
                  </div>
                  <div className="action-buttons" style={{ marginTop: 12 }}>
                    <button type="submit" className="btn label white_color" disabled={loading}>
                      처리 내용 저장
                    </button>
                    <button 
                      type="button" 
                      onClick={alertBlacklist} 
                      className="blacklist-button label"
                      disabled={loading}
                    >
                      블랙리스트 등록
                    </button>
                  </div>
                </form>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button className="btn label white_color" onClick={()=>setOpenComplaint(false)}>
                  닫기
                </button>
              </div>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'flex-end', marginTop:'10px'}}>
            <button className="btn label white_color" onClick={()=>setOpenBlackList(true)}>블랙리스트</button>
          </div>
        </div>
      </div>
      <Footer/>
      <AlertModal/>
      <BlackList open={openBlackList} onClose={CloseBlackList}/>
    </div>
  );
};

export default BlacklistManagement;
