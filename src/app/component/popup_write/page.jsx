'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';

// 토글 스위치 컴포넌트 (커스텀)
function ToggleSwitch({ isToggled, onToggle }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isToggled} onChange={onToggle} />
      <span className="switch" />
    </label>
  );
}

// 팝업 등록/수정 폼
function PopupForm({ popup, onChange, onSubmit, onCancel, save, previewUrl, isEdit }) {
  return (
    <div className="popup-form" onSubmit={onSubmit}>
      <div className='flex column gap_10'>
        <p className='label'>제목</p>
        <input type="text" name="title" value={popup.title} onChange={onChange} required />
      </div>
      <div className='flex gap_10 align_center'>
        <div className='flex column gap_10'>
          <p className='label'>시작일자</p>
          <input type="date" name="start_date" value={popup.start_date} onChange={onChange} required />
        </div>
        <div className='flex column gap_10'>
          <p className='label'>종료일자</p>
          <input type="date" name="end_date" value={popup.end_date} onChange={onChange} required />
        </div>
      </div>
      <div className='flex gap_10 align_center'>
        <div className='flex column gap_10'>
          <p className='label'>Width(px)</p>
          <input type="number" name="popup_width" value={popup.popup_width} onChange={onChange} />
        </div>
        <div className='flex column gap_10'>
          <p className='label'>Height(px)</p>
          <input type="number" name="popup_height" value={popup.popup_height} onChange={onChange} />
        </div>
      </div>
      <div className='flex column gap_10'>
        <p className='label'>Top</p>
        <input type="text" name="position_top" value={popup.position_top == "" ? 50 : popup.position_top} onChange={onChange} />
      </div>
      <div className='flex gap_10 align_center'>
        <div className='flex column gap_10'>
          <p className='label'>Left</p>
          <input type="text" name="position_left" value={popup.position_left == "" ? 50 : popup.position_left } onChange={onChange} />
        </div>
        <div className='flex column gap_10'>
          <p className='label'>Right</p>
          <input type="text" name="position_right" value={popup.position_right} onChange={onChange} />
        </div>
      </div>
      <div className='flex column gap_10'>
        <p className='label'>Bottom</p>
        <input type="text" name="position_bottom" value={popup.position_bottom} onChange={onChange} />
      </div>

      <div className='flex column gap_10 mt_20'>
        <p className='label text_left'>팝업 이미지</p>
        <input type="file" name="popup_image" required onChange={onChange} />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="미리보기"
            style={{ maxWidth: '300px', border: '1px solid #ddd' }}
          />
        )}
      </div>
      <div className="flex-row flex">
        <p className='label'>활성화</p>
        <ToggleSwitch isToggled={popup.use_toggle} onToggle={() => onChange({ target: { name: 'use_toggle', value: !popup.use_toggle } })} />
      </div>
      <div className="form-actions">
        <button className='btn label white_color' type="button" onClick={onCancel}>취소</button>
        <button className='btn label white_color' type="submit" onClick={save}>{isEdit ? '수정' : '저장'}</button>
      </div>
    </div>
  );
}

// 메인 팝업 관리 컴포넌트
export default function PopupTable() {
  const [popups, setPopups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // 모달 열기(등록/수정)
  const openModal = (popup = null) => {
    setEditingPopup(
      popup
        ? { ...popup }
        : {
            popup_idx: null,
            title: '',
            start_date: '',
            end_date: '',
            popup_width: '',
            popup_height: '',
            position_top: '50',
            position_right: '',
            position_bottom: '',
            position_left: '50',
            use_toggle: false,
            file_name: '',
            popup_image: null,
          }
    );
    setIsEdit(!!popup);
    if (popup && popup.file_name) {
      setPreviewUrl(`http://localhost/image/${popup.file_name}`);
    } else {
      setPreviewUrl(null);
    }
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setEditingPopup(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsEdit(false);
  };

  // 폼 값 변경
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setEditingPopup((prev) => ({
        ...prev,
        [name]: file,
      }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setEditingPopup((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 저장(등록/수정)
  const popup_save = async (e) => {
    e.preventDefault();
    let user_id = sessionStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('title', editingPopup.title);
    formData.append('user_id', user_id);
    formData.append('start_date', editingPopup.start_date);
    formData.append('end_date', editingPopup.end_date);
    formData.append('popup_width', editingPopup.popup_width);
    formData.append('popup_height', editingPopup.popup_height);
    formData.append('position_top', editingPopup.position_top);
    formData.append('position_right', editingPopup.position_right);
    formData.append('position_bottom', editingPopup.position_bottom);
    formData.append('position_left', editingPopup.position_left);
    formData.append('use_toggle', editingPopup.use_toggle);
    if (editingPopup.popup_image) {
      formData.append('popup_image', editingPopup.popup_image);
    }
    if (isEdit) {
      formData.append('popup_idx', editingPopup.popup_idx);
      // 수정 요청
      const { data } = await axios.post('http://localhost/popup_update', formData);
      if (data.success) {
        alert('팝업 수정 완료');
        closeModal();
        popup_list();
      } else {
        alert('팝업 수정 실패');
      }
    } else {
      // 등록 요청
      const { data } = await axios.post('http://localhost/popup_write', formData);
      if (data.success) {
        alert('팝업 등록 완료');
        closeModal();
        popup_list();
      } else {
        alert('팝업 등록 실패');
      }
    }
  };

  // 삭제
  const handleDelete = async (popup_idx) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { data } = await axios.post(`http://localhost/popup_delete/${popup_idx}`);
      if (data.success) {
        alert('팝업 삭제 완료');
        popup_list();
      } else {
        alert('팝업 삭제 실패');
      }
    }
  };

  // 토글 변경
  const handleToggle = async (popup_idx) => {
    const { data } = await axios.get('http://localhost/toggle/' + popup_idx);
    if (data.success) {
      await popup_list();
    } else {
      alert('토글 변경 실패');
    }
  };

  useEffect(() => {
    popup_list();
  }, []);

  const popup_list = async () => {
    const { data } = await axios.get('http://localhost/popup_list');
    setPopups(data.data);
  };

  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>팝업 등록 페이지</p>
      </div>
      <div className='padding_120_0 wrap'>
        <button onClick={() => openModal()} className="register-btn label font_weight_400 white_color">
          팝업 등록
        </button>
        <div className="popup-table">
          <div className="popup-table-header">
            <div className='content_text'>제목</div>
            <div className='content_text'>기간</div>
            <div className='content_text'>활성화</div>
            <div className='content_text'>관리</div>
          </div>
          {popups.map((popup) => (
            <div className="popup-table-row" key={popup.popup_idx}>
              <div className='label font_weight_400'>{popup.title}</div>
              <div className='label font_weight_400'>
                {popup.start_date} ~ {popup.end_date}
              </div>
              <div>
                <ToggleSwitch
                  isToggled={popup.use_toggle}
                  onToggle={() => handleToggle(popup.popup_idx)}
                />
              </div>
              <div className="flex align_center gap_10 justify_con_center">
                <button className='label btn white_color font_weight_400' onClick={() => openModal(popup)}>수정</button>
                <button className='label btn white_color font_weight_400' onClick={() => handleDelete(popup.popup_idx)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
        {/* 모달 */}
        {showModal && (
          <div className="modal-bg">
            <div className="modal-content">
              <h3 className='middle_title2 mb_20'>{isEdit ? '팝업 수정' : '팝업 등록'}</h3>
              <PopupForm
                popup={editingPopup}
                onChange={handleChange}
                onSubmit={popup_save}
                onCancel={closeModal}
                save={popup_save}
                previewUrl={previewUrl}
                isEdit={isEdit}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
