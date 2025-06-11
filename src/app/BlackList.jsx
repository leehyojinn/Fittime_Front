'use client'

import React, {useEffect, useState} from "react";
import axios from "axios";

function FindModal({ open, onClose }){

    const [blackList, setBlackList] = useState([]);

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        getBlackList();
    }, [open]);

    const getBlackList = async () => {
        const {data} = await axios.post('http://localhost/list/blacklist');
        console.log(data);
        setBlackList(data.blacklist);
    }

    const UnBlackList = async (b)=>{
        const {data} = await axios.post(`http://localhost/del/blacklist/${b.blacklist_idx}`,{user_id:b.target_id});
        console.log(data);
        if(data.success){
            getBlackList();
        }
    }



    if (!open) return null;

    return(
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
                    width: '600px'
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
                    닫기
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>블랙리스트</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <>
                        <div>
                            <table className="mypage-table">
                                {blackList?.length>0 &&(
                                    <thead>
                                    <tr><th>아이디</th><th>이름</th><th>등록 날짜</th><th>관리</th></tr>
                                    </thead>
                                )}
                                <tbody>
                                {blackList?.map(b=>(
                                    <tr key={b.blacklist_idx}>
                                        <td>
                                            <img src={`http://localhost/profileImg/profile/${b.trainer_id}`} alt="트레이너" style={{width:32,height:32,borderRadius:'50%',marginRight:8,verticalAlign:'middle'}} />
                                            {b.target_id}
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            {b.name}
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            {b.reg_date}
                                        </td>
                                        <td  style={{textAlign:'center'}}>
                                            <button className="mypage-small-btn" onClick={()=>UnBlackList(b)}>해제</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                </div>
            </div>
        </div>
    );
}

export default FindModal;