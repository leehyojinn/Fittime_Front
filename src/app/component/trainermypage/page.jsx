'use client'

import React, {useEffect, useState} from 'react';
import { FaStar, FaCalendarAlt, FaUser, FaEdit, FaCamera, FaPlus } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import {useAuthStore, usePasswordStore} from "@/app/zustand/store";
import axios from "axios";
import TagModal from "@/app/TagModal";
import { useRouter } from 'next/navigation';

const TrainerMyPage = () => {
    const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
    const [editMode, setEditMode] = useState(false);
    const [trainer, setTrainer] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [subImages, setSubImages] = useState(trainer.sub_images);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [subImageFiles, setSubImageFiles] = useState(null);
    const [reservation, setReservation] = useState([]);
    const [reservationPage, setReservationPage] = useState(1);
    const [reservationTotalPage, setReservationTotalPage] = useState(3);
    const [reviews, setReviews] = useState([]);
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewTotalPage, setReviewTotalPage] = useState(1);
    const [schedules, setSchedules] = useState([]);
    const [schedulePage, setSchedulePage] = useState(1);
    const [scheduleTotalPage, setScheduleTotalPage] = useState(1);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();

    const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { minLevel: 2 });
    }, [checkAuthAndAlert, router]);

    const handleMoveComplaint = (r) => {
        router.push(`/component/complaint?review_idx=${r.review_idx}&target_id=${r.user_id}&report_id=${typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""}`);
    }

    const handleMainImageChange = e => {
        if (e.target.files[0]) {
            // console.log(e.target.files[0]);
            const newImage = URL.createObjectURL(e.target.files[0]);
            setMainImage(newImage);
            setMainImageFile(e.target.files[0]);
        }
    };
    const handleSubImagesChange = e => {
        const files = Array.from(e.target.files).slice(0, 10);
        setSubImages(files.map(f => URL.createObjectURL(f)));
        setSubImageFiles(files);
    };

    const changeTrainer = (e) =>{
        let {name,value} = e.target;
        // console.log(value.address);
        setTrainer((prevForm) => ({
            ...prevForm,
            [name]: value
        }))
    }

    const tagModalClose = async() =>{
        setTagModalOpen(false);
        await getTrainer();
    }

    useEffect(() => {
        getTrainer();
        getReservation();
        getReviews();
        getSchedules();
    }, []);

    useEffect(() => {
        getReservation();
        getReviews();
        getSchedules();
    }, [schedulePage, reservationPage, reviewPage]);

    const getTrainer = async () => {
        await axios.post(`${apiUrl}/detail/profile`,{"trainer_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "","user_level":typeof window !== "undefined" ? sessionStorage.getItem("user_level") : ""})
            .then(({data}) => {
                console.log(data);
                setTrainer(data);
                setMainImage(`${apiUrl}/profileImg/profile/${typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""}`);
                setSubImages(data.photos?.map(photo => `${apiUrl}/centerImg/${photo.profile_file_idx}`));
                //console.log(profileImage);
            })
    }

    const getReservation = async () =>{
        const {data} = await axios.post(`${apiUrl}/list/trainerBook?page=${reservationPage}`,{"trainer_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id"):""});
        console.log('reservation',data);
        setReservation(data.bookingList||[]);
    }

    const getReviews = async () => {
        const {data} = await axios.post(`${apiUrl}/list/reviewByTrainer?page=${reviewPage}`,{"trainer_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""});
        setReviews(data.reviews);
        console.log('review',data);
    }

    const getSchedules = async () => {
        const {data} = await axios.post(`${apiUrl}/schedule_list/${typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""}`);
        setSchedules(data.list);
        console.log('schedules',data);
    }

    const edit = async() =>{
        setEditMode(!editMode);
        // console.log(editMode);
        const formData = new FormData();
        if(editMode){
            switch (true) {
                case (mainImageFile && subImageFiles && subImageFiles.length > 0):
                    // 둘 다 있는 경우
                    formData.append('file',mainImageFile);
                    subImageFiles.forEach((file) => {
                        formData.append('files', file); // 배열이 아닌 각각 append
                    });
                    formData.append('param',new Blob([JSON.stringify(trainer)], { type: "application/json" }));
                    break;

                case (mainImageFile && !subImageFiles):
                    // 메인 이미지만 있는 경우
                    formData.append('file',mainImageFile);
                    formData.append('param',new Blob([JSON.stringify(trainer)], { type: "application/json" }));
                    break;

                case (!mainImageFile && subImageFiles && subImageFiles.length > 0):
                    // 서브 이미지들만 있는 경우
                    subImageFiles.forEach((file) => {
                        formData.append('files', file); // 배열이 아닌 각각 append
                    });
                    formData.append('param',new Blob([JSON.stringify(trainer)], { type: "application/json" }));
                    break;

                case (!mainImageFile && !subImageFiles):
                    // 둘 다 없는 경우
                    formData.append('param',new Blob([JSON.stringify(trainer)], { type: "application/json" }));
                    break;

                default:
                    // 혹시 모를 예외 처리
                    break;
            }
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            const {data} = await axios.post(`${apiUrl}/update/Profile`, formData,{
                headers: {'Content-Type': 'multipart/form-data'}
            });
            // console.log('data',data);
            await getTrainer();
        }
    }


  return (

    <div>
        <Header/>
        <div className='wrap padding_120_0'>

            <div className="mypage-container">
            <h2 className='middle_title2'>트레이너 마이페이지</h2>
            <div className="mypage-profile">
                <img src={mainImage} alt="프로필" className="mypage-profile-img" />
                {editMode && (
                <label className="btn white_color label">
                    <FaCamera /> 대표이미지 변경
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleMainImageChange} />
                </label>
                )}
                <div className="mypage-subimg-list">
                    {subImages && subImages.map((img, idx) => (
                    <img key={idx} src={img} alt="트레이너 추가 이미지" className="mypage-subimg" />
                    ))}
                    {editMode && (
                    <label className="btn white_color label">
                        <FaPlus /> 추가이미지
                        <input type="file" multiple accept="image/*" style={{display:'none'}} onChange={handleSubImagesChange} />
                    </label>
                    )}
                </div>
                <div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">이름</span>
                    <span className="label font_weight_400">{trainer.name}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">아이디</span>
                    <span className="label font_weight_400">{trainer.user_id}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">연락처</span>
                    {editMode ? <input className='width_fit' name='phone' value={trainer.phone} onChange={changeTrainer}/> : <span className="label font_weight_400">{trainer.phone}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">이메일</span>
                    {editMode ? <input className='width_fit' defaultValue={trainer.email} name='email' value={trainer.email} onChange={changeTrainer}/> : <span className="label font_weight_400">{trainer.email}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">성별/나이</span>
                    <span className="label font_weight_400">{trainer.gender} / {trainer.age}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">주소</span>
                    {editMode ? <input className='width_fit' defaultValue={trainer.address} name='address' value={trainer.address} onChange={changeTrainer}/> : <span className="label font_weight_400">{trainer.address}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">소속센터</span>
                    <span className="label font_weight_400">{trainer.center_name} ({trainer.center_address})</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">센터 연락처</span>
                    <span className="label font_weight_400">{trainer.center_phone}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">태그</span>
                    {trainer.tags && trainer.tags.map((item,trainer_idx)=>{
                        return(<span key={trainer_idx} className="mypage_tag">{item}</span>);
                    })}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">소개</span>
                    {editMode ? <textarea className='width_fit' defaultValue={trainer.career} name='career' value={trainer.career} onChange={changeTrainer}/> : <span className="label font_weight_400">{trainer.career}</span>}
                </div>
                {editMode ?
                <div className="mypage-profile-row position_rel">
                    <span className="label font_weight_500">비밀번호</span>
                    <input type={passwordVisible ? "text" : "password"} className='width_fit' defaultValue={trainer.password} name='password' value={trainer.password} onChange={changeTrainer} />
                    <span className="material-symbols-outlined mypage_password_position" onClick={togglePasswordVisibility}>visibility</span>
                </div> : ''}
                <button className="btn white_color label mr_10" onClick={edit}>
                    <FaEdit /> {editMode ? '수정완료' : '정보수정'}
                </button>
                <button className="btn white_color label" onClick={()=>setTagModalOpen(true)}>
                    <FaEdit /> 태그추가
                </button>
                </div>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 예약 내역</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원</th><th>연락처</th><th>상품</th><th>날짜</th><th>시간</th><th>상태</th></tr>
                </thead>
                <tbody>
                    {reservation && reservation.map(r=>(
                    <tr key={r.reservation_idx}>
                        <td>{r.user_name}</td>
                        <td>{r.user_phone}</td>
                        <td>{r.product_name}</td>
                        <td>{r.date}</td>
                        {r.exercise_level === 'class'?<td>{r.class_start_time}~{r.class_end_time}</td>:<td>{r.start_time}~{r.end_time}</td>}
                        <td>{r.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
                {reservationTotalPage > 1 ?
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        {reservationPage > 1 ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setReservationPage(reservationPage-1)}>이전</button>
                            :<div style={{width:'fit-content'}}></div>}
                        {reservationPage < reservationTotalPage ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setReservationPage(reservationPage+1)}>다음</button>
                            :''}
                    </div> : ''
                }
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaStar /> 받은 리뷰</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원</th><th>별점</th><th>내용</th><th>작성일</th><th>신고</th></tr>
                </thead>
                <tbody>
                    {reviews && reviews.map(r=>(
                    <tr key={r.review_id}>
                        <td>{r.user_name}</td>
                        <td>{r.rating}</td>
                        <td>{r.content}</td>
                        <td>{r.reg_date.substring(0,10)}</td>
                        <td>{(typeof window !== "undefined" ? sessionStorage.getItem("user_level") : "") >= 2 && <div style={{display:'flex',justifyContent:'center'}}>
                            <button className='warning-button ' onClick={()=>handleMoveComplaint(r)}>
                                <span class="material-symbols-outlined">warning</span>
                                <span className='material-symbols-outlined-text' style={{fontSize:'1.2rem'}}>신고하기</span>
                            </button>
                        </div>}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
                {reviewTotalPage > 1 ?
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        {reviewPage > 1 ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setReviewPage(reviewPage-1)}>이전</button>
                            :<div style={{width:'fit-content'}}></div>}
                        {reviewPage < reviewTotalPage ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setReviewPage(reviewPage+1)}>다음</button>
                            :''}
                    </div> : ''
                }
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 내 스케줄</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>일정명</th><th>시작</th><th>종료</th><th>구분</th></tr>
                </thead>
                <tbody>
                    {schedules && schedules.map(s=>(
                    <tr key={s.schedule_idx}>
                        <td>{s.title}</td>
                        <td>{s.start_time}</td>
                        <td>{s.end_time}</td>
                        <td>{s.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
                {scheduleTotalPage > 1 ?
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        {schedulePage > 1 ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setSchedulePage(schedulePage-1)}>이전</button>
                            :<div style={{width:'fit-content'}}></div>}
                        {schedulePage < scheduleTotalPage ?
                            <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>setSchedulePage(schedulePage+1)}>다음</button>
                            :''}
                    </div> : ''
                }
            </div>
        </div>
        <TagModal open={tagModalOpen} onClose={tagModalClose} />
        <Footer/>
    </div>  
  );
};

export default TrainerMyPage;
