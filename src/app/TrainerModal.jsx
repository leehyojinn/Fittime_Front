'use client';
import React, { useState } from 'react';
import axios from "axios";

function TrainerModal({ open, onClose }) {
    const [tab, setTab] = useState('pw'); // 'id' 또는 'pw'
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [result, setResult] = useState(null); // 결과 화면 상태


    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setResult(null);
        setEmail('');
        setUserId('');
        setTab('id');
        onClose();
    };

    if (!open) return null;

    const insertData = async () =>{
        await axios.post('http://localhost/user');
    }

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
                        fontSize: '1.3rem',
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

                        {/* 탭 내용 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <>
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
                                        //onClick={handleResetPw}
                                        onClick={insertData}
                                    >
                                        비밀번호 재설정
                                    </button>
                                </>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TrainerModal;
