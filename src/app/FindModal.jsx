'use client';
import React, { useState } from 'react';
import axios from "axios";

function FindModal({ open, onClose }) {
    const [tab, setTab] = useState('id'); // 'id' 또는 'pw'
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [result, setResult] = useState(null); // 결과 화면 상태

    // "아이디 찾기" 버튼 클릭 시
    const handleFindId = async() => {
        const {data} = await axios.post('http://localhost/find/id',{email});
        console.log(data);
        if (data.success) {
            setResult({
                type: 'id',
                message: `해당 이메일로 가입된 아이디는 [${data.user_id}] 입니다.`
            });
        } else {
            setResult({
                type: 'id',
                message: '해당 이메일로 가입된 아이디를 찾을 수 없습니다.'
            });
        }
    };

    // "비밀번호 재설정" 버튼 클릭 시
    const handleResetPw = async() => {
        const {data} = await axios.post(`http://localhost/emailSend/${userId}`,{email:email});
        if (data.success) {
            setResult({
                type:'pw',
                message: data.msg
            });
        }else {
            setResult({
                type: 'pw',
                message: data.msg
            });
        }
    };

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setResult(null);
        setEmail('');
        setUserId('');
        setTab('id');
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '350px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '2rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>아이디/비밀번호 찾기</h3>
                {/* 결과 화면 */}
                {result ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <div style={{ fontSize: '1.3rem', marginBottom: 20, color: '#007bff', fontWeight: 'bold' }}>
                            {result.type === 'id' ? '아이디 찾기 결과' : '비밀번호 재설정 안내'}
                        </div>
                        <div style={{ fontSize: '1.2rem', marginBottom: 24 }}>{result.message}</div>
                        <button
                            className="btn label white_color bg_primary_color_2"
                            onClick={handleClose}
                        >
                            닫기
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 탭 버튼 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <button
                                className={`btn label white_color ${tab === 'id' ? 'bg_primary_color_2' : 'bg_primary_color_2'}`}
                                style={{
                                    padding: '8px 20px',
                                    cursor: 'pointer',
                                    fontWeight: tab === 'id' ? 'bold' : 'normal'
                                }}
                                onClick={() => setTab('id')}
                            >
                                아이디 찾기
                            </button>
                            <button
                                className={`btn label white_color ${tab === 'pw' ? 'bg_primary_color_1' : 'bg_primary_color_2'}`}
                                style={{
                                    padding: '8px 20px',
                                    cursor: 'pointer',
                                    fontWeight: tab === 'pw' ? 'bold' : 'normal'
                                }}
                                onClick={() => setTab('pw')}
                            >
                                비밀번호 찾기
                            </button>
                        </div>
                        {/* 탭 내용 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {tab === 'id' && (
                                <>
                                    <label style={{ fontSize: '12.5px', marginTop: 19,fontWeight: 'bold' }}>이메일</label>
                                    <input
                                        type="email"
                                        placeholder="가입한 이메일 입력"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ width: '100%', marginTop: 4 }}
                                    />
                                    <button
                                        className="btn label white_color"
                                        style={{ marginTop: 8 }}
                                        onClick={handleFindId}
                                    >
                                        아이디 찾기
                                    </button>
                                </>
                            )}
                            {tab === 'pw' && (
                                <>
                                    <label style={{ fontSize: '12.5px', marginTop: 19,fontWeight: 'bold' }}>이메일</label>
                                    <input
                                        type="email"
                                        placeholder="가입한 이메일 입력"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ width: '100%', marginTop: 4 }}
                                    />
                                    <label style={{ fontSize: '12.5px', marginTop: 12,fontWeight: 'bold'}}>아이디</label>
                                    <input
                                        type="text"
                                        placeholder="아이디 입력"
                                        value={userId}
                                        onChange={e => setUserId(e.target.value)}
                                        style={{ width: '100%', marginTop: 4 }}
                                    />
                                    <button
                                        className="btn label white_color"
                                        style={{ marginTop: 8 }}
                                        onClick={handleResetPw}
                                    >
                                        비밀번호 재설정
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FindModal;
