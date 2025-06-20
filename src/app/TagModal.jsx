'use client'

import React, {useEffect, useState} from "react";
import axios from "axios";

function FindModal({ open, onClose }){

    const [tags, setTags] = useState([]);
    const [selectTags, setSelectTags] = useState([]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        getTags();
    }, [open]);

    const getTags = async () => {
        const {data} = await axios.post(`${apiUrl}/list/tags/${sessionStorage.getItem('user_level')}`);
        // console.log(data);
        setTags(data.tags);
    }

    const toggleTag = (tag_idx) => {

        setSelectTags((prev) => {
                if (prev.includes(tag_idx)) {
                    return prev.filter((t) => t !== tag_idx); // 제거
                } else if(prev.length > 4){
                    return prev;
                } else {
                        return [...prev, tag_idx]; // 추가
                }
        });
        console.log(selectTags);
    };

    const insertTag = async ()=>{
        const {data} = await axios.post(`${apiUrl}/insert/tags`,{'user_level':sessionStorage.getItem('user_level'),'user_id':sessionStorage.getItem('user_id'),'tags':selectTags});
        console.log(data);
            setTags([]);
            setSelectTags([]);
            await onClose();
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
                    닫기
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>태그 리스트</h3>
                <h3 style={{fontSize: '13px', marginBottom: '5px'}}>최대 5개까지 가능합니다</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <span style={{display: 'grid', gridTemplateColumns:'repeat(3,1fr)', gap: '5px'}} >
                            {tags?.map((item,idx)=>{
                                const isSelected = selectTags.includes(item.tag_idx);
                                return(<span key={item.tag_idx} className={`tag_List ${isSelected ? 'selected' : ''}`} onClick={()=>{toggleTag(item.tag_idx)}}>{item.tag_name}</span>);
                            })}
                            </span>
                            <button
                                className="btn label white_color"
                                style={{ marginTop: 8 }}
                                onClick={insertTag}
                            >
                                태그 추가
                            </button>
                        </>
                </div>
            </div>
        </div>
    );
}

export default FindModal;