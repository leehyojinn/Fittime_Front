'use client'

import React, { useRef, useState } from 'react';
import Header from '../../Header';
import Footer from '../../Footer';
import Link from 'next/link';
import { usePasswordStore } from '../../zustand/store';
import axios from 'axios';

const JoinPage = () => {
    const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
    const [isIdAvailable, setIsIdAvailable] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);

    // 폼 상태 관리
    const [form, setForm] = useState({
        user_level: '1',
        name : '',
        user_id: '',
        password: '',
        phone: '',
        address: '',
        email: '',
        gender: '남자',
        age: '',
        status: 'active', //상태 기본 active
    });

    const addressInputRef = useRef(null);

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
        // eslint-disable-next-line no-undef
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
    };

  // ID 중복 체크 함수
    const handleCheckId = async () => {
        if (!form.user_id) {
            alert('아이디를 입력해주세요');
            return;
        }
        
        const {data} = await axios.post('http://localhost/overlay/id', {
            user_id: form.user_id
        });
        
        if (data.use) {
            alert('사용 가능한 아이디입니다');
            setIsIdAvailable(true);
        } else {
            alert('이미 사용 중인 아이디입니다');
            setForm(prev => ({ ...prev, user_id: '' }));
            setIsIdAvailable(false);
        }

    };

    // email 중복 체크 함수
    const handleCheckEmail = async () => {
        if (!form.email) {
            alert('이메일을 입력해주세요');
            return;
        }

        const {data} = await axios.post('http://localhost/overlay/email', {
            email: form.email
        });

        if (data.use) {
            alert('사용 가능한 이메일입니다');
            setIsEmailAvailable(true);
        } else {
            alert('이미 사용 중인 이메일입니다');
            setForm(prev => ({ ...prev, email: '' }));
            setIsEmailAvailable(false);
        }
    };

    // 회원가입 함수
    const join = async () => {
        if (!isIdAvailable) {
            alert('아이디 중복 체크를 해주세요');
            return;
        }

        if (!isEmailAvailable) {
            alert('이메일 중복 체크를 해주세요');
            return;
        }
        
        let {data} = await axios.post('http://localhost/join', form);
        if(data.success){
            alert('회원가입 성공!');
            window.location.href = '/component/login';
        }else{
            alert('회원가입 실패! 다시 시도해주세요');
        }

    };

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
                            className='width_500'
                            required
                            value={form.user_level}
                            onChange={handleChange}
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
                                className='width_500'
                                required
                                placeholder='아이디를 입력해주세요'
                                value={form.user_id}
                                onChange={handleChange}
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
                                className='width_500'
                                required
                                placeholder='패스워드를 입력해주세요'
                                value={form.password}
                                onChange={handleChange}
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
                            className='width_500'
                            placeholder='이름을 입력해주세요'
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>
                    {/* 주소 */}
                    <div className='flex column gap_10 align_center justify_con_center'>
                        <p className='content_text width_500 text_left'>주소</p>
                        <input
                            type="text"
                            name="address"
                            className='width_500'
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
                        <p className='content_text width_500 text_left'>email</p>
                        <div className='flex align_center gap_10 justify_con_center'>
                            <input
                                type="email"
                                name="email"
                                className='width_500'
                                placeholder='e-mail을 입력해주세요'
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        <button className='btn white_color label' style={{position:'absolute',top:'108.4%',right:'25%'}} onClick={handleCheckEmail}>중복체크</button>
                    </div>
                    {/* 성별 */}
                    <div className='flex column gap_10 align_center justify_con_center'>
                        <p className='content_text width_500 text_left'>성별</p>
                        <select
                            name="gender"
                            className='width_500'
                            required
                            value={form.gender}
                            onChange={handleChange}
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
                            className='width_500'
                            placeholder='나이를 입력해주세요'
                            value={form.age}
                            onChange={handleChange}
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
        </div>
    );
};

export default JoinPage;
