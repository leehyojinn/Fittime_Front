'use client'

import React, {useEffect, useState} from 'react';
import { FaStar, FaCalendarAlt, FaTicketAlt, FaCoins, FaEdit, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from "axios";
import {useAuthStore, usePasswordStore} from "@/app/zustand/store";
import {useRouter} from "next/navigation";

const userData={
  address:"",
  age:0,
  email:"",
  gender:"",
  name:"",
  password:"",
  phone:"",
  status:"",
  user_id: "",
  user_level:""
}

const MemberMyPage = () => {

  const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(userData);
  const [profileImage, setProfileImage] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reservationPage, setReservationPage] = useState(1);
  const [reservationTotalPage, setReservationTotalPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPage, setReviewTotalPage] = useState(1);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  useEffect(() => {
    checkAuthAndAlert(router, null, { minLevel: 0 });
  }, [checkAuthAndAlert, router]);

  // 프로필 이미지 변경 핸들러
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      // console.log(e.target.files[0]);
      const newImage = URL.createObjectURL(e.target.files[0]);
      setProfileImage(newImage);
      setProfileFile(e.target.files[0]);
    }
  };

  const handleMoveReview = (r)=>{
    router.push(`/component/review?center_id=${r.center_id}&trainer_id=${r.trainer_id}&reservation_idx=${r.reservation_idx}&trainer_name=${r.trainer_name}&&center_name=${r.center_name}`);
  }

  useEffect(() => {
    getUser();
    getReservations();
    getReviews();
  }, []);

  useEffect(() => {
    getReservations();
  }, [reservationPage]);

  const getUser = async () => {
    await axios.post(`${apiUrl}/detail/profile`,{"user_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "","user_level":typeof window !== "undefined" ? sessionStorage.getItem("user_level") : ""})
        .then(({data}) => {
          // console.log(data);
          setUser(data);
          setProfileImage(`${apiUrl}/profileImg/profile/${typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""}`);
          //console.log(profileImage);
        })
  }

  const getReservations = async () => {
    await axios.post(`${apiUrl}/list/userBook?page=${reservationPage || 1}`,{"user_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""})
        .then(({data}) => {
          setReservations(data.bookingList);
          setReservationPage(data.page);
          setReservationTotalPage(data.totalPage);
        })
  }

  const getReviews = async () => {
    await axios.post(`${apiUrl}/list/reviewByUser?page=${reviewPage}`,{"user_id":typeof window !== "undefined" ? sessionStorage.getItem("user_id") : ""})
        .then(({data}) => {
          console.log('review',data);
          setReviews(data.reviews);
          setReviewPage(data.page);
          setReviewTotalPage(data.totalPage);
        })
  }

  const handleDeleteReview = async (idx) =>{
    const {data} = await axios.post(`${apiUrl}/del/review/${idx}`);
    console.log(data.success);
    if(data.success){
      getReviews();
    }
  }

  const handleUpdateReview = async(idx) =>{
    const {data} = await axios.get(`${apiUrl}/get/review/${idx}`);
    console.log(data);
    router.push(`/component/review?center_id=${data.map.center_id}&trainer_id=${data.map.trainer_id}&reservation_idx=${data.map.reservation_idx}&trainer_name=${data.map.trainer_name}&&center_name=${data.map.center_name}&review_idx=${idx}`);
    //router.push(`/component/review?`);
  }

  const changeUser = (e) =>{
    let {name,value} = e.target;
    // console.log(value.address);
    setUser((prevForm) => ({
      ...prevForm,
      [name]: value
    }))
  }

  const edit = async() =>{
    setEditMode(!editMode);
    // console.log(editMode);
    if(editMode){
      const formData = new FormData();
      if(profileFile){
        formData.append('file',profileFile);
        formData.append('param',new Blob([JSON.stringify(user)], { type: "application/json" }));
        const {data} = await axios.post(`${apiUrl}/update/Profile`, formData, {
          headers: {'content-type': 'multipart/form-data'}
        })
        console.log(data);
      }
      else {
        formData.append('param',new Blob([JSON.stringify(user)], { type: "application/json" }));
        // console.log('user',user);
        const {data} = await axios.post(`${apiUrl}/update/Profile`, formData, {
          headers: {'content-type': 'multipart/form-data'}
        });
        // console.log('data',data);
        await getUser();
      }
    }
  }

  console.log(user);

  return (
    <div>
      <Header/>
      <div className='wrap padding_120_0'>
        <div className="mypage-container">
          <h2 className='middle_title2'>마이페이지</h2>
          <div className="mypage-profile">
            <div className="profile-image-container">
              <img src={profileImage || null} alt="프로필" className="mypage-profile-img" />
              {editMode && (
                <label className="btn label white_color mt_20">
                  <FaCamera /> 이미지 변경
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div style={{width: 'calc(100% - 140px)'}}>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">이름</span>
                <span className="label font_weight_400">{user.name}</span>
              </div>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">아이디</span>
                <span className="label font_weight_400">{user.user_id}</span>
              </div>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">연락처</span>
                {editMode ? <input className='width_fit' defaultValue={user.phone} name='phone' value={user.phone} onChange={changeUser}/> : <span className="label font_weight_400">{user.phone}</span>}
              </div>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">이메일</span>
                {editMode ? <input className='width_fit' defaultValue={user.email} name='email' value={user.email} onChange={changeUser}/> : <span className="label font_weight_400">{user.email}</span>}
              </div>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">성별/나이</span>
                <span className="label font_weight_400">{user.gender} / {user.age}</span>
              </div>
              <div className="mypage-profile-row">
                <span className="label font_weight_500">주소</span>
                {editMode ? <input className='width_fit' defaultValue={user.address} name='address' value={user.address} onChange={changeUser} /> : <span className="label font_weight_400">{user.address}</span>}
              </div>
              {editMode ?
              <div className="mypage-profile-row position_rel">
                <span className="label font_weight_500">비밀번호</span>
                <input type={passwordVisible ? "text" : "password"} className='width_fit' defaultValue={user.password} name='password' value={user.password} onChange={changeUser} />
                <span className="material-symbols-outlined mypage_password_position" onClick={togglePasswordVisibility}>visibility</span>
              </div> : ''}
            </div>
              <button className="btn white_color label margin_0_auto" onClick={edit} >
                <FaEdit /> {editMode ? '수정완료' : '정보수정'}
              </button>
          </div>
          {/* 후순위 */}
          {/* <div className="mypage-point-coupon">
            <div className="mypage-point">
              <FaCoins /> 포인트 <span className="point-value">{user.point.toLocaleString()}P</span>
            </div>
            <div className="mypage-coupon">
              <FaTicketAlt /> 쿠폰 <span className="coupon-value">{mockCoupons.filter(c=>!c.used).length}장</span>
            </div>
          </div> */}
          <div className="mypage-section">
            <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 예약 내역</h4>
            <table className="mypage-table">
              <thead>
                <tr><th>센터</th><th>상품</th><th>날짜</th><th>시간</th><th>트레이너</th><th>상태</th><th>리뷰쓰기</th></tr>
              </thead>
              <tbody>
                {reservations?.map(r=>(
                  <tr key={r.reservation_idx}>
                    <td>{r.center_name}</td>
                    <td>{r.product_name}</td>
                    <td>{r.date}</td>
                    <td>{(r.start_time && r.end_time)? `${r.start_time} ~ ${r.end_time}` :''}</td>
                    <td>{r.trainer_name}</td>
                    <td>{r.status}</td>
                    <td style={{textAlign:'center'}}><button className="mypage-small-btn white_color label" onClick={()=>handleMoveReview(r)}>리뷰쓰기</button></td>
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
            <h4 className='label text_left font_weight_500'><FaStar /> 내가 쓴 리뷰</h4>
            <table className="mypage-table">
              <thead>
                <tr><th>대상</th><th>구분</th><th>별점</th><th>내용</th><th>작성일</th><th>관리</th></tr>
              </thead>
              <tbody>
                {reviews?.map(r=>(
                  <tr key={r.review_idx}>
                    <td>{r.target_id}</td>
                    <td>{r.level == 2 ? '트레이너' : '센터'}</td>
                    <td>{r.rating}</td>
                    <td>{r.content}</td>
                    <td>{r.reg_date.substring(0,10)}</td>
                    <td style={{textAlign:'center'}}>
                      <div style={{display:'flex', justifyContent:'center'}}>
                      <button className="mypage-small-btn white_color label" style={{ marginRight:'5px'}} onClick={()=>handleUpdateReview(r.review_idx)}>
                        수정
                      </button>
                      <button className="mypage-small-btn white_color label" style={{letterSpacing:'inherit'}} onClick={()=>handleDeleteReview(r.review_idx)}>
                        삭제
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reviewTotalPage > 1 ?
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                {reviewPage > 1 ?
                    <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>reviewPage(reviewPage-1)}>이전</button>
                    :<div style={{width:'fit-content'}}></div>}
                {reviewPage < reviewTotalPage ?
                    <button className="review-submit-btn width_fit" style={{fontSize:'1.2rem', margin:'3px'}} onClick={()=>reviewPage(reviewPage+1)}>다음</button>
                    :''}
              </div> : ''
          }
          {/* 후순위 */}
          {/* <div className="mypage-section">
            <h4><FaTicketAlt /> 내 쿠폰</h4>
            <table className="mypage-table">
              <thead>
                <tr><th>쿠폰번호</th><th>설명</th><th>유효기간</th><th>사용여부</th></tr>
              </thead>
              <tbody>
                {mockCoupons.map(c=>(
                  <tr key={c.coupon_key}>
                    <td>{c.coupon_key}</td>
                    <td>{c.description}</td>
                    <td>{c.expire}</td>
                    <td>{c.used ? '사용함' : '미사용'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default MemberMyPage;
