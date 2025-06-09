'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Header from '../../Header';
import Footer from '../../Footer';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import ko from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAlertModalStore, useAuthStore } from '@/app/zustand/store';
import AlertModal from '../alertmodal/page';
import CustomToolbar from './CustomToolbar';
import * as endDate from "date-fns";
import { useRouter } from 'next/navigation';

const locales = {
  'ko': ko,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

export default function MyCalendar() {
  
  const [events, setEvents] = useState([]);
  const [inputInfo, setInputInfo] = useState({ open: false, start: null, end: null, x: 0, y: 0 });
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
  const [view, setView] = useState('month');

  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  useEffect(() => {
    checkAuthAndAlert(router, null, { noGuest: true });
  }, [checkAuthAndAlert, router]);

  // 에러 상태
  const [errors, setErrors] = useState({});
  const inputRef = useRef();
  const inputModalRef = useRef(null);
  const detailModalRef = useRef(null);

  const { openModal } = useAlertModalStore();

  const STATUS_COLORS = {
    '일정': '#b9d394',
    '휴무': '#ff8d8f',
    '회원예약': '#98afba',
    '트레이너예약': '#98afba',
  };

  const fetchEvents = useCallback(async () => {
    try {
      const trainer_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";
  
      const [eventRes, userRes, reservationRes, dayoffRes] = await Promise.all([
        axios.post(`http://localhost/schedule_list/${user_id}`), // 개인 일정
        axios.post(`http://localhost/user_reservation_schedule/${user_id}`, {}), // 회원용 예약 일정
        axios.post(`http://localhost/trainer_reservation_schedule/${trainer_id}`, {}), // 트레이너용 예약 일정
        axios.post(`http://localhost/center_dayoff/${trainer_id}`), // 트레이너 휴무
      ]);
      const combinedEvents = [];

      // 개인 일정
      (eventRes.data.list || []).forEach(item => {
        combinedEvents.push({
          id: item.schedule_idx,
          title: item.title,
          start: new Date(item.start_date),
          end: new Date(item.end_date),
          allDay: true,
          resource: { ...item }
        });
      });
  
      // 회원용 예약 일정
      (userRes.data.userList || []).forEach(item => {
        const title = `${item.center_name} (${item.start_time} ~ ${item.end_time})`;
        const today = new Date(item.reservation_date);
        const [sh, sm] = (item.start_time || '').split(':');
        const [eh, em] = (item.end_time || '').split(':');
        const start = sh && sm ? new Date(today.setHours(+sh, +sm, 0, 0)) : new Date(today);
        const end = eh && em ? new Date(today.setHours(+eh, +em, 0, 0)) : new Date(today);
  
        combinedEvents.push({
          title,
          start: today,
          end: today,
          allDay: false,
          resource: {
            product_name: item.title,
            start_time: item.start_time,
            end_time: item.end_time,
            status: '회원예약',
            center_name: item.center_name
          }
        });
      });
  
      // 트레이너용 예약 일정
      (reservationRes.data.trainerList || []).forEach(item => {
        const title = `${item.product_name} (${item.start_time} ~ ${item.end_time})`;
        const today = new Date(item.reservation_date);
        const [sh, sm] = (item.start_time || '').split(':');
        const [eh, em] = (item.end_time || '').split(':');
        const start = sh && sm ? new Date(today.setHours(+sh, +sm, 0, 0)) : new Date(today);
        const end = eh && em ? new Date(today.setHours(+eh, +em, 0, 0)) : new Date(today);
  
        combinedEvents.push({
          title,
          start,
          end,
          allDay: false,
          resource: {
            product_name: item.product_name,
            start_time: item.start_time,
            end_time: item.end_time,
            status: '트레이너예약',
            user_name: item.user_name,
            center_name: item.center_name
          }
        });
      });
  
      // 휴무 일정
      (dayoffRes.data.dayoff || []).forEach(item => {
        combinedEvents.push({
          title: item.title || '휴무',
          start: new Date(item.start_date),
          end: new Date(item.end_date),
          allDay: true,
          status: '휴무',
          resource: { ...item },
        });
      });

      setEvents(combinedEvents);
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: '일정 불러오기 실패',
        showCancel: false,
      });
    }
  }, [user_id]);

    useEffect(() => {
      fetchEvents();
    }, [fetchEvents]);

  // 날짜 클릭: 등록 인풋 오픈 (단일 날짜)
  const handleSelectSlot = (slotInfo) => {
    // slotInfo.start, slotInfo.end: Date 객체
    // slotInfo.action: 'select', 'click', etc.
    const isSingleDay = format(slotInfo.start, 'yyyy-MM-dd') === format(addDays(slotInfo.end, -1), 'yyyy-MM-dd');
    setInputInfo({
      open: true,
      start: slotInfo.start,
      end: addDays(slotInfo.end, -1), // end는 inclusive로 맞춤
      x: 0,
      y: 0
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
  const handleSelectEvent = (event) => {
    console.log(event);
    setDetailInfo({
      open: true,
      event: event,
      x: 0,
      y: 0
    });
    setEditForm(null);
  };

  // 일정 등록
  const handleRegister = async () => {
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
        start_date: format(inputInfo.start, 'yyyy-MM-dd'),
        end_date: format(inputInfo.end, 'yyyy-MM-dd'),
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
        start_date: format(event.start, 'yyyy-MM-dd'),
        end_date: format(addDays(event.end, -1), 'yyyy-MM-dd'),
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

  const eventPropGetter = (event, start, end, isSelected) => {
    // status는 event.resource.status에 들어있음
    const status = event.resource?.status || '일정';
    const backgroundColor = STATUS_COLORS[status] || '#2196f3';

    return {
      style: {
        backgroundColor,
        color: '#fff',
        borderRadius: '4px',
        border: isSelected ? '2px solid #1976d2' : 'none',
        cursor: 'pointer',
        fontWeight: 600,
        paddingLeft: 6,
        paddingRight: 6,
        minHeight: 24
      }
    };
  };

  // 상세정보에서 수정 버튼 클릭 시
  const startEdit = () => {
    setEditForm({
      title: detailInfo.event.title,
      content: detailInfo.event.resource.content,
      start_time: detailInfo.event.resource.start_time,
      end_time: detailInfo.event.resource.end_time,
      status: detailInfo.event.resource.status
    });
  };

  // 상세정보 수정 저장
  const saveEdit = async () => {
    await handleUpdate(detailInfo.event, editForm);
    setEditForm(null);
  };

  // 캘린더에 보여지는 이벤트
  const CustomEvent = ({event}) => {
    const {product_name, start_time, end_time, center_name, status} = event.resource || {};

    /*if (!product_name || !start_time || !end_time) {
      return (
          <div style={{whiteSpace: 'pre-line'}}>
            {event.title}
          </div>
      );
    }*/

    if (status === '회원예약') {
      return (
          <div style={{whiteSpace: 'pre-line'}}>
            {center_name} {start_time?.substring(0, 5)} ~ {end_time?.substring(0, 5)}
          </div>
      );
    }

    if (status === '트레이너예약') {
      return (
          <div style={{whiteSpace: 'pre-line'}}>
            {product_name} {start_time?.substring(0, 5)} ~ {end_time?.substring(0, 5)}
          </div>
      );
    }
    return <div style={{ whiteSpace: 'pre-line'}}>{event.title}</div>
  };

  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>스케줄 관리</p>
      </div>
      <div className='wrap padding_120_0' style={{ position: 'relative', height:'100%', overflow: 'visible' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          views={['month']}
          defaultView={view}
          onView={setView}
          selectable={true}
          popup={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          style={{ height: '80vh' }}
          messages={{
            next: "다음달",
            previous: "이전달",
            today: "오늘",
            month: "월",
            week: "주",
            day: "일",
            showMore: total => `+${total}개 더보기`
          }}
          culture="ko"
          components={{ toolbar: CustomToolbar, event: CustomEvent }}
        />
        {/* 일정 등록 인풋 모달 */}
        {inputInfo.open && (
            <div
                className='modal-overlay'
            style={{
              width:'100vw',
              height:'100vh',
              zIndex:1999 /*모달보다 아래, 다른 요소보다 위*/
            }}
            onClick={() => setInputInfo({...inputInfo, open: false})}> {/*바깥 누르면 닫히게*/}
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
                <label className='label'>일정 날짜</label>
                <div className='label' style={{ marginBottom: 8 }}>
                  {inputInfo.start && inputInfo.end
                    ? format(inputInfo.start, 'yyyy-MM-dd') === format(inputInfo.end, 'yyyy-MM-dd')
                      ? format(inputInfo.start, 'yyyy-MM-dd')
                      : `${format(inputInfo.start, 'yyyy-MM-dd')} ~ ${format(inputInfo.end, 'yyyy-MM-dd')}`
                    : ''}
                </div>
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
                </select>
                <div className="modal-btns justify_con_end">
                  <button className='label' onClick={() => setInputInfo({ ...inputInfo, open: false })}>취소</button>
                  <button className='label' onClick={handleRegister}>등록</button>
                </div>
              </div>
            </div>
        )}
        {/* 상세정보/수정 모달 */}
        {detailInfo.open && detailInfo.event && (
            <div
                className='modal-overlay'
                style={{
                  width:'100vw',
                  height:'100vh',
                  zIndex:1999
                }}
                onClick={() => setDetailInfo({...detailInfo, open: false})}>
              <div
                ref={detailModalRef}
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
                    <p className='label'>날짜 : {format(detailInfo.event.start, 'yyyy-MM-dd') === format(detailInfo.event.end, 'yyyy-MM-dd')
                      ? format(detailInfo.event.start, 'yyyy-MM-dd')
                      : `${format(detailInfo.event.start, 'yyyy-MM-dd')} ~ ${format(detailInfo.event.end, 'yyyy-MM-dd')}`}</p>
                    <p className='label'>내용 : {detailInfo.event.resource.content}</p>
                    {detailInfo.event.resource.start_time !== null && detailInfo.event.resource.end_time !== null && (
                        <p className='label'>시간 : {detailInfo.event.resource.start_time?.substring(0, 5)} ~ {detailInfo.event.resource.end_time?.substring(0, 5)}</p>
                    )}
                    <p className='label'>
                      {detailInfo.event.resource.user_name ? `회원명 : ${detailInfo.event.resource.user_name}`
                          : detailInfo.event.resource.trainer_name ? `강사명 : ${detailInfo.event.resource.trainer_name}`
                          : ''}</p>
                      {detailInfo.event.resource.status !== '회원예약' &&
                          detailInfo.event.resource.status !== '트레이너예약' && (
                            <p className='label'>{detailInfo.event.resource.status}</p>
                          )}
                    <div className='flex justify_con_end align_center modal-btns'>
                      <button className='label' onClick={startEdit}>수정</button>
                      <button className='label' onClick={() => handleDelete(detailInfo.event)}>삭제</button>
                      <button className='label' onClick={() => setDetailInfo({ open: false, event: null, x: 0, y: 0 })}>닫기</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        )}
      </div>
      <Footer />
      <AlertModal/>
    </div>
  );
}
