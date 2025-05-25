'use client'

import React, { useRef, useState } from 'react';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import { useAlertModalStore, usePasswordStore } from '../../zustand/store';
import axios from 'axios';
import AlertModal from '../alertmodal/page';

const REQUIRED_FIELDS = [
  { name: 'user_level', label: '회원가입 종류' },
  { name: 'user_id', label: '아이디' },
  { name: 'password', label: '패스워드' },
  { name: 'name', label: '이름' },
  { name: 'address', label: '주소' },
  { name: 'email', label: '이메일' },
  { name: 'gender', label: '성별' },
  { name: 'age', label: '나이' },
];

const JoinPage = () => {
  const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [form, setForm] = useState({
    user_level: '1',
    name: '',
    user_id: '',
    password: '',
    phone: '',
    address: '',
    email: '',
    gender: '남자',
    age: '',
    status: 'active',
  });

  // zustand modal store
  const openModal = useAlertModalStore((state) => state.openModal);

  // 각 input의 ref 저장
  const inputRefs = {
    user_level: useRef(null),
    user_id: useRef(null),
    password: useRef(null),
    name: useRef(null),
    address: useRef(null),
    email: useRef(null),
    gender: useRef(null),
    age: useRef(null),
  };

  // 에러 상태
  const [errors, setErrors] = useState({});

  // 주소 input ref
  const addressInputRef = inputRefs.address;

  // 카카오 주소 검색 스크립트 로딩
  const loadDaumPostcodeScript = () => {
    return new Promise((resolve) => {
      if (window.daum?.Postcode) return resolve();
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  // 주소 입력란 클릭 시 카카오 주소 검색창 오픈
  const handleAddressClick = async () => {
    await loadDaumPostcodeScript();
    new window.daum.Postcode({
      oncomplete: function(data) {
        setForm((prev) => ({ ...prev, address: data.address }));
        addressInputRef.current?.focus();
      }
    }).open();
  };

  // input, select 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  // ID 중복 체크 함수
  const handleCheckId = async () => {
    if (!form.user_id) {
      openModal({
        svg : '❗',
        msg1: '알림',
        msg2: '아이디를 입력해주세요.',
      });
      inputRefs.user_id.current?.focus();
      setErrors((prev) => ({ ...prev, user_id: true }));
      return;
    }
    const { data } = await axios.post('http://localhost/overlay/id', {
      user_id: form.user_id
    });
    if (data.use) {
      openModal({
        svg: '✔',
        msg1: '알림',
        msg2: '사용 가능한 아이디입니다.',
      });
      setIsIdAvailable(true);
    } else {
      openModal({
        svg : '❗',
        msg1: '알림',
        msg2: '이미 사용 중인 아이디입니다.',
      });
      setForm(prev => ({ ...prev, user_id: '' }));
      setIsIdAvailable(false);
      setErrors((prev) => ({ ...prev, user_id: true }));
      inputRefs.user_id.current?.focus();
    }
  };

  // 회원가입 함수
  const join = async () => {
    // 필수값 체크
    let firstError = null;
    let newErrors = {};
    for (const { name } of REQUIRED_FIELDS) {
      if (!form[name] || (typeof form[name] === 'string' && form[name].trim() === '')) {
        newErrors[name] = true;
        if (!firstError) firstError = name;
      }
    }
    setErrors(newErrors);

    if (firstError) {
      openModal({
        svg : '❗',
        msg1: '입력 오류',
        msg2: `${REQUIRED_FIELDS.find(f => f.name === firstError).label}을(를) 입력해주세요.`,
        showCancel: false
      });
      inputRefs[firstError].current?.focus();
      return;
    }

    if (!isIdAvailable) {
      openModal({
        svg : '❗',
        msg1: '알림',
        msg2: '아이디 중복 체크를 해주세요.',
        showCancel: false
      });
      inputRefs.user_id.current?.focus();
      setErrors((prev) => ({ ...prev, user_id: true }));
      return;
    }

    let { data } = await axios.post('http://localhost/join', form);
    if (data.success) {
      openModal({
        svg: '✔',
        msg1: '회원가입 성공!',
        msg2: '로그인 페이지로 이동합니다.',
        onConfirm: () => { window.location.href = '/component/login'; },
        showCancel: false,
      });
    } else {
      openModal({
        svg: '❗',
        msg1: '회원가입 실패',
        msg2: '다시 시도해주세요.',
        showCancel: false,
      });
    }
  };

  // 빨간색 테두리 + 트랜지션 스타일
  const getInputClass = (name, base = 'width_500') =>
    `${base} ${errors[name] ? 'input-error' : ''}`;

  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title white_color'>회원가입 페이지</p>
      </div>
      <div className='wrap padding_120_0 flex'>
        <div className='flex column gap_20 align_center justify_con_center'>
          {/* 회원가입 종류 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text text_left width_500'>회원가입 종류</p>
            <select
              name="user_level"
              className={getInputClass('user_level')}
              required
              value={form.user_level}
              onChange={handleChange}
              ref={inputRefs.user_level}
            >
              <option value="1">회원</option>
              <option value="2">트레이너</option>
              <option value="3">센터 관리자</option>
            </select>
          </div>
          {/* 아이디 */}
          <div className='flex column gap_10 align_center justify_con_center position_rel'>
            <p className='content_text width_500 text_left'>아이디</p>
            <div className='flex align_center gap_10 justify_con_center'>
              <input
                type="text"
                name="user_id"
                className={getInputClass('user_id')}
                required
                placeholder='아이디를 입력해주세요'
                value={form.user_id}
                onChange={handleChange}
                ref={inputRefs.user_id}
              />
            </div>
            <button className='btn white_color label' style={{position:'absolute',top:'53%',right:'25%'}} onClick={handleCheckId}>중복체크</button>
          </div>
          {/* 패스워드 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>패스워드</p>
            <div className='position_rel width_500'>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                className={getInputClass('password')}
                required
                placeholder='패스워드를 입력해주세요'
                value={form.password}
                onChange={handleChange}
                ref={inputRefs.password}
              />
              <span
                className="material-symbols-outlined password_position"
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              >
                {passwordVisible ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>
          {/* 연락처 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>연락처</p>
            <input
              type="number"
              name="phone"
              className='width_500'
              placeholder='숫자만 입력해주세요'
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          {/* 이름 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>이름</p>
            <input
              type="text"
              name="name"
              className={getInputClass('name')}
              placeholder='이름을 입력해주세요'
              value={form.name}
              onChange={handleChange}
              ref={inputRefs.name}
            />
          </div>
          {/* 주소 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>주소</p>
            <input
              type="text"
              name="address"
              className={getInputClass('address')}
              required
              placeholder='주소를 입력해주세요'
              value={form.address}
              ref={addressInputRef}
              onClick={handleAddressClick}
              readOnly
              style={{ cursor: 'pointer', backgroundColor: '#f8f8f8' }}
            />
          </div>
          {/* 이메일 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>이메일</p>
            <input
              type="email"
              name="email"
              className={getInputClass('email')}
              placeholder='e-mail을 입력해주세요'
              value={form.email}
              onChange={handleChange}
              ref={inputRefs.email}
            />
          </div>
          {/* 성별 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>성별</p>
            <select
              name="gender"
              className={getInputClass('gender')}
              required
              value={form.gender}
              onChange={handleChange}
              ref={inputRefs.gender}
            >
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>
          </div>
          {/* 나이 */}
          <div className='flex column gap_10 align_center justify_con_center'>
            <p className='content_text width_500 text_left'>나이</p>
            <input
              type="number"
              name="age"
              className={getInputClass('age')}
              placeholder='나이를 입력해주세요'
              value={form.age}
              onChange={handleChange}
              ref={inputRefs.age}
            />
          </div>
          {/* 버튼 영역 */}
          <div className='flex gap_10 align_center justify_con_center mt_20'>
            <Link href={'/'}>
              <button className='btn label white_color' type="button">취소</button>
            </Link>
            <button className='btn label white_color' type="button" onClick={join}>회원가입</button>
          </div>
        </div>
      </div>
      <Footer/>
      <AlertModal />
    </div>
  );
};

export default JoinPage;
