'use client'

import React, {useEffect, useState} from 'react';
import { FaStar, FaCalendarAlt, FaTicketAlt, FaCoins, FaEdit, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from "axios";
import {usePasswordStore} from "@/app/zustand/store";
import {useRouter} from "next/navigation";

const mockUser = {
  user_id: 'user123',
  user_name: '홍길동',
  phone: '010-1234-5678',
  email: 'hong@naver.com',
  gender: '남',
  age: 28,
  address: '서울 강남구 역삼동',
  profile_image: '/member.png',
  point: 3500
};

const userData={
  address:"",
  age:0,
  email:"",
  gender:"",
  name:"",
  password:"",
  phone:"",
  status:"",
  user_id:sessionStorage.getItem("user_id"),
  user_level:sessionStorage.getItem('user_level')
}

const mockReservations = [
  { reservation_idx: 1, center_name: '헬스월드 강남점', product_name: '헬스 1개월', date: '2025-05-21', start_time: '10:00', end_time: '11:00', trainer_name: '', status: '예약완료' },
  { reservation_idx: 2, center_name: '피트니스클럽', product_name: 'PT 10회', date: '2025-05-25', start_time: '15:00', end_time: '16:00', trainer_name: '김트레이너', status: '예약완료' }
];

const mockReviews = [
  { review_id: 1, target: '헬스월드 강남점', type: '센터', rating: 5, content: '시설이 정말 좋아요!', date: '2025-05-10' },
  { review_id: 2, target: '김트레이너', type: '트레이너', rating: 4.5, content: '운동법을 꼼꼼히 알려주셔서 좋아요.', date: '2025-05-12' }
];
const mockCoupons = [
  { coupon_key: 'C123456', description: '1만원 할인', expire: '2025-06-30', used: false },
  { coupon_key: 'C987654', description: '5% 할인', expire: '2025-05-31', used: true }
];

const MemberMyPage = () => {

  const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(userData);
  const [profileImage, setProfileImage] = useState(mockUser.profile_image);
  const [profileFile, setProfileFile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  // 프로필 이미지 변경 핸들러
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      // console.log(e.target.files[0]);
      const newImage = URL.createObjectURL(e.target.files[0]);
      setProfileImage(newImage);
      setProfileFile(e.target.files[0]);
    }
  };

  const handleMoveReview = (center_id,trainer_id,reservation_idx,trainer_name,center_name)=>{
    router.push(`/component/review?center_id=${center_id}&trainer_id=${trainer_id}&reservation_idx=${reservation_idx}&trainer_name=${trainer_name}&&center_name=${center_name}`);
  }

  useEffect(() => {
    getUser();
    getReservations();
    getReviews();
  }, []);

  const getUser = async () => {
    await axios.post('http://localhost/detail/profile',{"user_id":sessionStorage.getItem("user_id"),"user_level":sessionStorage.getItem("user_level")})
        .then(({data}) => {
          // console.log(data);
          setUser(data);
          setProfileImage(`http://localhost/profileImg/profile/${sessionStorage.getItem("user_id")}`);
          //console.log(profileImage);
        })
  }

  const getReservations = async () => {
    await axios.post('http://localhost/list/userBook',{"user_id":sessionStorage.getItem("user_id")})
        .then(({data}) => {
          setReservations(data.bookingList);
          console.log(data.bookingList);
        })
  }

  const getReviews = async () => {
    await axios.post('http://localhost/list/reviewByUser',{"user_id":sessionStorage.getItem("user_id")})
        .then(({data}) => {
          console.log(data);
          setReviews(data.reviews);
        })
  }

  const handleDeleteReview = async (idx) =>{
    const {data} = await axios.post(`http://localhost/del/review/${idx}`);
    console.log(data.success);
  }

  const handleUpdateReview = (r) =>{
    console.log(r);
    router.push(`/component/review?idx=${r.review_idx}`);
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
        const {data} = await axios.post('http://localhost/update/Profile', formData, {
          headers: {'content-type': 'multipart/form-data'}
        })
        console.log(data);
      }
      else {
        formData.append('param',new Blob([JSON.stringify(user)], { type: "application/json" }));
        // console.log('user',user);
        const {data} = await axios.post('http://localhost/update/Profile', formData, {
          headers: {'content-type': 'multipart/form-data'}
        });
        // console.log('data',data);
        await getUser();
      }
    }
  }

  return (
    <div>
      <Header/>
      <div className='wrap padding_120_0'>
        <div className="mypage-container">
          <h2 className='middle_title2'>마이페이지</h2>
          <div className="mypage-profile">
            <div className="profile-image-container">
              <img src={profileImage} alt="프로필" className="mypage-profile-img" />
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
                    <td>{r.start_time}~{r.end_time}</td>
                    <td>{r.trainer_name}</td>
                    <td>{r.status}</td>
                    <td style={{textAlign:'center'}}><button className="mypage-small-btn white_color label" style={{background:'#444444'}} onClick={()=>handleMoveReview(r.center_id,r.trainer_id,r.reservation_idx,r.trainer_name,r.center_name)}>리뷰쓰기</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                      <button className="mypage-small-btn white_color label" style={{background:'#444444', marginRight:'5px'}} onClick={()=>handleUpdateReview(r)}>
                        수정
                      </button>
                      <button className="mypage-small-btn white_color label" style={{background:'#444444',letterSpacing:'inherit'}} onClick={()=>handleDeleteReview(r.review_idx)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
