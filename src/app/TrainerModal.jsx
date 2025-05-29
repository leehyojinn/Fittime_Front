'use client';
import React, { useState } from 'react';
import axios from "axios";
import {FaTrash} from "react-icons/fa";

function TrainerModal({ open, onClose , handleMoveTrainerDetail, center_idx}) {
    const [userId, setUserId] = useState('');
    const [trainers, setTrainers] = useState([]);


    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setUserId('');
        setTrainers([]);
        onClose();
    };

    // 트레이너 검색
    const searchTrainers = async ()=>{
        const {data} = await axios.post('http://localhost/search/trainers',{"id":userId})
        console.log(userId);
        console.log(data);
        setTrainers(data.trainers);
    }

    // 소속 트레이너 추가
    const insertTrainer= async (trainer_idx) =>{
        const {data} = await axios.post('http://localhost/add/trainer',{"trainer_idx": trainer_idx, "center_idx" : center_idx});
        console.log(data);
        if(data.success){
            await searchTrainers();
        }
    }


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
                        fontSize: '1.3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>트레이너 찾기</h3>
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
                                        onClick={searchTrainers}
                                    >
                                        트레이너 검색
                                    </button>
                                    <div>
                                        <table className="mypage-table">
                                            {trainers?.length>0 &&(
                                            <thead>
                                            <tr><th>이름</th><th>프로필</th><th>관리</th></tr>
                                            </thead>
                                                )}
                                            <tbody>
                                            {trainers?.map(t=>(
                                                <tr key={t.trainer_id}>
                                                    <td>
                                                        <img src={`http://localhost/profileImg/profile/${t.trainer_id}`} alt="트레이너" style={{width:32,height:32,borderRadius:'50%',marginRight:8,verticalAlign:'middle'}} />
                                                        {t.name}
                                                    </td>
                                                    <td style={{textAlign:'center'}}>
                                                        <button className="mypage-small-btn" onClick={()=>handleMoveTrainerDetail(t.trainer_idx)}>보기</button>
                                                    </td>
                                                    <td>
                                                        <button className="mypage-small-btn" onClick={()=>insertTrainer(t.trainer_idx)}>추가</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                        </div>
                    </>
            </div>
        </div>
    );
}

export default TrainerModal;
