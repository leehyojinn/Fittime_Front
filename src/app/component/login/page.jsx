'use client';

import { useState } from 'react';
import Header from '../../Header';
import Footer from '../../Footer';
import { useAlertModalStore, usePasswordStore } from '../../zustand/store';
import FindModal from '@/app/FindModal';
import axios from 'axios';
import AlertModal from '../alertmodal/page';

function LoginPage() {
    const [idImg, setIdImg] = useState('/id1.png');
    const [form, setForm] = useState({
        user_id: '',
        password: ''
    });

    const { openModal } = useAlertModalStore();

    const handleIdChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }));
    }

    const handleIdFocus = (e) => {
        const inputLength = e.target.value.length;
        if (inputLength === 0) {
            setIdImg('/id1.png');
        } else if (inputLength === 1) {
            setIdImg('/id2.png');
        } else if (inputLength === 2) {
            setIdImg('/id3.png');
        } else if (inputLength >= 3) {
            setIdImg('/id4.png');
        }
    };

    const handleIdBlur = () => {
        setIdImg('/id1.png');
    };

    const handlePwFocus = () => {
        setIdImg('/pw1.png');
        setTimeout(() => {
            setIdImg('/pw2.png');
        }, 120);
    };

    const handleIdInput = (e) => {
        handleIdFocus(e);
        handleIdChange(e);
    };

    const style = {
        transition: 'all 0.3s ease-in-out',
        backgroundImage: `url(${idImg})`,
        width: '150px',
        aspectRatio: '1 / 1',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    };

    const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
    const [findModalOpen, setFindModalOpen] = useState(false);

    const login = async () => {
        if (!form.user_id || !form.password) {
            openModal({
                svg: '❗',
                msg1: '로그인 실패',
                msg2: '아이디와 비밀번호를 입력해주세요.',
                showCancel: false
            });
            return;
        }
        let { data } = await axios.post('http://localhost/login', form);
        if (data.success) {
            sessionStorage.setItem('user_id', form.user_id);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user_level', data.user_level);
            window.location.href = '/';
        } else {
            openModal({
                svg: '❗',
                msg1: '로그인 실패',
                msg2: data && data.message
                    ? data.message
                    : '로그인에 실패했습니다. \n 아이디와 비밀번호를 확인해주세요.',
                showCancel: false
            });
        }
    };

    const keyHandler = (e) => {
        if (e.key === 'Enter') {
            login();
        }
    }

    return (
        <div>
            <Header />
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title white_color'>로그인 페이지</p>
            </div>
            <div className='wrap flex column gap_10 padding_120_0'>
                <div className="margin_0_auto" style={style}></div>
                <div className="flex column gap_10 align_center">
                    <div className='flex column gap_10 align_center justify_con_center'>
                        <p className='content_text'>아이디</p>
                        <input
                            style={{ width: "300px" }}
                            type="text"
                            name='user_id'
                            onFocus={handleIdFocus}
                            onBlur={handleIdBlur}
                            value={form.user_id}
                            onChange={handleIdInput} />
                    </div>
                    <div className='flex column gap_10 align_center justify_con_center'>
                        <p className='content_text'>비밀번호</p>
                        <div className='position_rel width_300'>
                            <input
                                type={passwordVisible ? "text" : "password"}
                                name='password'
                                value={form.password}
                                onKeyUp={keyHandler}
                                onChange={handleIdChange}
                                onFocus={handlePwFocus}
                            />
                            <span
                                className="material-symbols-outlined password_position"
                                onClick={togglePasswordVisibility}
                            >
                                visibility
                            </span>
                        </div>
                    </div>
                    <div className='flex gap_10 align_center justify_con_center mt_20'>
                        <button className='btn label white_color width_fit' onClick={() => setFindModalOpen(true)}>아이디/비밀번호 찾기</button>
                        <button className='btn label white_color' onClick={login}>로그인</button>
                    </div>
                </div>
            </div>
            <FindModal open={findModalOpen} onClose={() => setFindModalOpen(false)} />
            <Footer />
            <AlertModal /> {/* AlertModal은 항상 하단에 렌더링 */}
        </div>
    );
}

export default LoginPage;
