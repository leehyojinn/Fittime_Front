'use client'

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Header from '../../Header';
import Footer from '../../Footer';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAlertModalStore } from '@/app/zustand/store';
import AlertModal from '../alertmodal/page';

const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [inputInfo, setInputInfo] = useState({ open: false, date: '', x: 0, y: 0 });
  const [form, setForm] = useState({
    title: '',
    content: '',
    start_time: '',
    end_time: '',
    status: '일정'
  });
  const [detailInfo, setDetailInfo] = useState({ open: false, event: null, x: 0, y: 0 });
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // 에러 상태
  const [errors, setErrors] = useState({});
  const inputRef = useRef();
  const inputModalRef = useRef(null);
  const detailModalRef = useRef(null);

  const { openModal } = useAlertModalStore();

  // 일정 리스트 불러오기
  const fetchEvents = async () => {
    try {
      const res = await axios.post(`http://localhost/schedule_list/${user_id}`);
      setEvents(
        res.data.list.map(item => ({
          id: item.schedule_idx,
          title: item.title,
          date: item.date,
          extendedProps: { ...item }
        }))
      );
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: '일정 불러오기 실패',
        showCancel: false,
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 날짜 클릭: 등록 인풋 오픈
  const handleDateClick = (info) => {
    setInputInfo({
      open: true,
      date: info.dateStr,
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY
    });
    setForm({
      title: '',
      content: '',
      start_time: '',
      end_time: '',
      status: '일정'
    });
    setErrors({});
    setTimeout(() => {
      inputRef.current && inputRef.current.focus();
    }, 50);
  };

  // 일정 클릭: 상세정보 모달
  const handleEventClick = (info) => {
    setDetailInfo({
      open: true,
      event: info.event,
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY
    });
    setEditForm(null);
  };

  // 일정 등록
  const handleRegister = async () => {
    // 제목 필수값 검사
    if (!form.title || form.title.trim() === '') {
      setErrors({ title: true });
      openModal({
        svg: '❗',
        msg1: '입력 오류',
        msg2: '제목을 입력해주세요.',
        showCancel: false,
      });
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 50);
      return;
    }
    setErrors({});

    try {
      await axios.post('http://localhost/schedule_insert', {
        user_id: user_id,
        title: form.title,
        content: form.content,
        date: inputInfo.date,
        start_time: form.start_time,
        end_time: form.end_time,
        status: form.status
      });
      setInputInfo({ ...inputInfo, open: false });
      fetchEvents();
      openModal({
        svg: '✔',
        msg1: '확인',
        msg2: '일정 등록을 완료하였습니다.',
        showCancel: false,
      });
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '등록 실패',
        msg2: err.response?.data?.message || '등록 실패',
        showCancel: false,
      });
    }
  };

  // 일정 삭제
  const handleDelete = async (event) => {
    openModal({
      svg: '❗',
      msg1: '일정 삭제',
      msg2: '정말 삭제하시겠습니까?',
      showCancel: true,
      onConfirm: async () => {
        try {
          await axios.post(`http://localhost/schedule_del/${user_id}/${event.id}`);
          setDetailInfo({ open: false, event: null, x: 0, y: 0 });
          setEditForm(null);
          fetchEvents();
        } catch (err) {
          openModal({
            svg: '❗',
            msg1: '삭제 실패',
            msg2: err.response?.data?.message || '삭제 실패',
            showCancel: false,
          });
        }
      }
    });
  };

  // 일정 수정
  const handleUpdate = async (event, editData) => {
    // 제목 필수값 검사
    if (!editData.title || editData.title.trim() === '') {
      setEditForm(prev => ({ ...prev, title: prev.title || '' }));
      openModal({
        svg: '❗',
        msg1: '입력 오류',
        msg2: '제목을 입력해주세요.',
        showCancel: false,
      });
      return;
    }
    try {
      await axios.post(`http://localhost/schedule_update/${user_id}/${event.id}`, {
        title: editData.title,
        content: editData.content,
        date: event.extendedProps.date,
        start_time: editData.start_time,
        end_time: editData.end_time,
        status: editData.status
      });
      setDetailInfo({ open: false, event: null, x: 0, y: 0 });
      setEditForm(null);
      fetchEvents();
      openModal({
        svg: '✔',
        msg1: '확인',
        msg2: '일정 수정을 완료하였습니다.',
        showCancel: false,
      });
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '수정 실패',
        msg2: err.response?.data?.message || '수정 실패',
        showCancel: false,
      });
    }
  };

  // 일정 렌더(hover시 삭제)
  const renderEventContent = (eventInfo) => (
    <div
      onMouseEnter={() => setHoveredEventId(eventInfo.event.id)}
      onMouseLeave={() => setHoveredEventId(null)}
      style={{
        position: 'relative',
        cursor: 'pointer'
      }}>
      <span>{eventInfo.event.title}</span>
      {
        hoveredEventId === eventInfo.event.id && (
          <span
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 2
            }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(eventInfo.event);
              }}
              style={{
                marginRight: 4,
                color: 'red'
              }}>삭제</button>
          </span>
        )
      }
    </div>
  );

  // 상세정보에서 수정 버튼 클릭 시
  const startEdit = () => {
    setEditForm({
      title: detailInfo.event.extendedProps.title,
      content: detailInfo.event.extendedProps.content,
      start_time: detailInfo.event.extendedProps.start_time,
      end_time: detailInfo.event.extendedProps.end_time,
      status: detailInfo.event.extendedProps.status
    });
  };

  // 상세정보 수정 저장
  const saveEdit = async () => {
    await handleUpdate(detailInfo.event, editForm);
    setEditForm(null);
  };

  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>개인일정</p>
      </div>
      <div className='wrap padding_120_0' style={{ position: 'relative' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
        />
        {/* 일정 등록 인풋 모달 */}
        {inputInfo.open && (
          <div
            ref={inputModalRef}
            className="custom-modal flex column gap_10"
            style={{
              width: '800px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              position: 'fixed',
              zIndex: 2000,
              background: '#fff',
              border: '1px solid #ccc',
              padding: 35
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 className='middle_title2'>일정 등록</h4>
            <label className='label'>제목</label>
            <input
              ref={inputRef}
              type="text"
              value={form.title}
              onChange={e => {
                setForm({ ...form, title: e.target.value });
                setErrors({ ...errors, title: false });
              }}
              className={errors.title ? 'input-error' : ''}
            />
            <label className='label'>내용</label>
            <input
              type="text"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
            <div className='flex gap_10'>
              <div className='flex column gap_10'>
                <label className='label'>시작시간</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className='flex column gap_10'>
                <label className='label'>종료시간</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <label className='label'>상태</label>
            <select
              className='label'
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option className='label' value="일정">일정</option>
              <option className='label' value="휴무">휴무</option>
              <option className='label' value="예약">예약</option>
            </select>
            <div className="modal-btns justify_con_end">
              <button className='label' onClick={() => setInputInfo({ ...inputInfo, open: false })}>취소</button>
              <button className='label' onClick={handleRegister}>등록</button>
            </div>
          </div>
        )}
        {/* 상세정보/수정 모달 */}
        {detailInfo.open && detailInfo.event && (
          <div
            ref={detailModalRef}
            className="custom-modal"
            style={{
              width: '800px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              position: 'fixed',
              zIndex: 2000,
              background: '#fff',
              border: '1px solid #ccc',
              padding: 35
            }}
            onClick={e => e.stopPropagation()}
          >
            {editForm ? (
              <div className='flex column gap_10'>
                <h4 className='middle_title2'>일정 수정</h4>
                <div className='flex column gap_10'>
                  <label className='label'>제목</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className={!editForm.title ? 'input-error' : ''}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className='flex column gap_10'>
                  <label className='label'>내용</label>
                  <input
                    type="text"
                    value={editForm.content}
                    onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className='flex align_center gap_10'>
                  <div className='flex column gap_10'>
                    <label className='label'>시작시간</label>
                    <input
                      type="time"
                      value={editForm.start_time}
                      onChange={e => setEditForm({ ...editForm, start_time: e.target.value })}
                    />
                  </div>
                  <div className='flex column gap_10'>
                    <label className='label'>종료시간</label>
                    <input
                      type="time"
                      value={editForm.end_time}
                      onChange={e => setEditForm({ ...editForm, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className='flex column gap_10'>
                  <label className='label'>상태</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="일정">일정</option>
                    <option value="휴무">휴무</option>
                    <option value="예약">예약</option>
                  </select>
                </div>
                <div className='modal-btns justify_con_center'>
                  <button className='label' onClick={() => setEditForm(null)} style={{ marginLeft: 10 }}>취소</button>
                  <button className='label' onClick={saveEdit}>저장</button>
                </div>
              </div>
            ) : (
              <div className='flex column gap_10'>
                <h4 className='middle_title2'>{detailInfo.event.title}</h4>
                <p className='label'>날짜 : {detailInfo.event.extendedProps.date}</p>
                <p className='label'>내용 : {detailInfo.event.extendedProps.content}</p>
                <p className='label'>시간 : {detailInfo.event.extendedProps.start_time} ~ {detailInfo.event.extendedProps.end_time}</p>
                <p className='label'>{detailInfo.event.extendedProps.status}</p>
                <div className='flex justify_con_end align_center modal-btns'>
                  <button className='label' onClick={startEdit}>수정</button>
                  <button className='label' onClick={() => handleDelete(detailInfo.event)}>삭제</button>
                  <button className='label' onClick={() => setDetailInfo({ open: false, event: null, x: 0, y: 0 })}>닫기</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      <AlertModal/>
    </div>
  );
}
