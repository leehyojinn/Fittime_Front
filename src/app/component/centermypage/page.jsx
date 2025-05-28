'use client'

import React, {useEffect, useState} from 'react';
import { FaStar, FaCalendarAlt, FaUser, FaEdit, FaPlus, FaTrash, FaCamera } from 'react-icons/fa';
import Header from '../../Header';
import Footer from '../../Footer';
import {usePasswordStore} from "@/app/zustand/store";
import axios from "axios";
import FindModal from "@/app/FindModal";
import findModal from "@/app/FindModal";
import TagModal from "@/app/TagModal";
import {useRouter} from "next/navigation";

const centerProfileSample = {
    center_idx: 1,
    center_name: '헬스월드 강남점',
    address: '서울 강남구 역삼동 123-45',
    phone: '02-1234-5678',
    introduction: '최신 장비와 쾌적한 환경의 24시간 프리미엄 헬스장',
    tags: ['24시간', '샤워시설', '주차가능'],
    homepage: 'https://center-homepage.com',
    open_hour: '06:00',
    close_hour: '23:00',
    parking: '가능',
    longitude: 127.123456,
    latitude: 37.123456,
    // 이미지 관리
    main_image: '/center.jpg',
    sub_images: [
      '/center.jpg', '/center.jpg', '/center.jpg','/center.jpg','/center.jpg'
      // 최대 10장까지
    ],
    products: [
      { product_idx: 1, product_name: '헬스 1개월', price: 100000, discount_rate: 10 }
    ],
    trainers: [
      { user_id: 'trainer1', user_name: '김트레이너', profile_image: '/member.png', phone: '010-2222-3333', rating: 4.8 }
    ]
  };
const mockCenterReservations = [
  { reservation_idx: 1, member_name: '홍길동', phone: '010-1234-5678', product_name: '헬스 1개월', date: '2025-05-21', start_time: '10:00', end_time: '11:00', trainer_name: '', status: '예약완료' },
  { reservation_idx: 2, member_name: '이영희', phone: '010-9876-5432', product_name: 'PT 10회', date: '2025-05-25', start_time: '15:00', end_time: '16:00', trainer_name: '김트레이너', status: '예약완료' }
];
const mockCenterReviews = [
  { review_id: 1, member_name: '회원A', rating: 5, content: '시설이 정말 좋아요!', date: '2025-05-10' },
  { review_id: 2, member_name: '회원B', rating: 4.5, content: '샤워실이 깨끗해서 만족!', date: '2025-05-12' }
];
const mockCenterSchedules = [
  { schedule_id: 1, title: '센터 휴무', start_time: '2025-05-22 00:00', end_time: '2025-05-22 23:59', type: '휴무' },
  { schedule_id: 2, title: '요가 클래스', start_time: '2025-05-23 14:00', end_time: '2025-05-23 15:00', type: '클래스' }
];

const CenterMyPage = () => {
  const { passwordVisible, togglePasswordVisibility } = usePasswordStore();
  const [editMode, setEditMode] = useState(false);
  const [center, setCenter] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [subImages, setSubImages] = useState(null);
  const [subImageFiles, setSubImageFiles] = useState(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const router = useRouter();
  const [trainers, setTrainers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);

    // 대표이미지 변경
    const handleMainImageChange = e => {
    if (e.target.files[0]) {
        setMainImage(URL.createObjectURL(e.target.files[0]));
        setMainImageFile(e.target.files[0]);
        }
    };

    // 추가이미지 최대 10장
    const handleSubImagesChange = e => {
    const files = Array.from(e.target.files).slice(0, 10);
        setSubImages(files.map(f => URL.createObjectURL(f)));
        setSubImageFiles(files);
    };

    // 입력
    const changeCenter = (e) =>{
        let {name,value} = e.target;
        // console.log(value.address);
        setCenter((prevForm) => ({
            ...prevForm,
            [name]: value
        }))
    }

    // 태그 modal 창 닫기
    const tagModalClose = async() =>{
        setTagModalOpen(false);
        await getCenter();
    }

    // Calendar page 이동
    const handleMoveCalendar = () =>{
        router.push('/component/calendar');
    }

    // Product page 이동
    const handleMoveProduct = () =>{
        router.push('/component/product');
    }

    // Trainer detail page 이동
    const handleMoveTrainerDetail = (idx) =>{
        router.push(`/component/trainerdetail?trainer_idx=${idx}`);
    }

    useEffect(() => {
        getCenter();
        getTrainer();
        getProducts();
    }, []);

    // 센터 정보 가져오기
    const getCenter = async () =>{
        const {data} = await axios.post('http://localhost/detail/profile',{"center_id":sessionStorage.getItem('user_id'), "user_level":sessionStorage.getItem('user_level')});
        console.log(data);
        setCenter(data);
        setMainImage(`http://localhost/profileImg/profile/${sessionStorage.getItem("user_id")}`);
        setSubImages(data.photos.map(photo => `http://localhost/centerImg/${photo.profile_file_idx}`));
        console.log(tagModalOpen);
    }

    // 상품 리스트 가져오기
    const getProducts = async () =>{
        const {data} = await axios.post('http://localhost/list/product',{'center_id':sessionStorage.getItem('user_id')});
        console.log(data.products);
        setProducts(data.products);
    }

    // 상품 활성화/비활성화
    const handleProductStaus = async (product_idx)=>{
        const {data} = await axios.get(`http://localhost/update/productStatus/${product_idx}`);
        console.log(data);
        await getProducts();
    }

    // 소속 트레이너 리스트 가져오기
    const getTrainer = async () =>{
        const {data} = await axios.post(`http://localhost/list/trainers/${sessionStorage.getItem('user_id')}`);
        console.log(data);
        setTrainers(data.trainers);
    }

    // 소속 트레이너 삭제
    const deleteTrainer = async (idx) =>{
        const {data} = await axios.post(`http://localhost/del/trainers/${idx}`);
        console.log(data);
        if(data.success){
            await getTrainer();
        }
    }

    // 예약 리스트 가져오기
    const getReservations = async () =>{
        const {data} = await axios.post('http://localhost/list/centerBook',{'center_id':sessionStorage.getItem('user_id')});
        console.log(data);
        setReservations(data.bookingList);
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
                    formData.append('param',new Blob([JSON.stringify(center)], { type: "application/json" }));
                    break;

                case (mainImageFile && !subImageFiles):
                    // 메인 이미지만 있는 경우
                    formData.append('file',mainImageFile);
                    formData.append('param',new Blob([JSON.stringify(center)], { type: "application/json" }));
                    break;

                case (!mainImageFile && subImageFiles && subImageFiles.length > 0):
                    // 서브 이미지들만 있는 경우
                    subImageFiles.forEach((file) => {
                        formData.append('files', file); // 배열이 아닌 각각 append
                    });
                    formData.append('param',new Blob([JSON.stringify(center)], { type: "application/json" }));
                    break;

                case (!mainImageFile && !subImageFiles):
                    // 둘 다 없는 경우
                    formData.append('param',new Blob([JSON.stringify(center)], { type: "application/json" }));
                    break;

                default:
                    // 혹시 모를 예외 처리
                    break;
            }
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            const {data} = await axios.post('http://localhost/update/Profile', formData,{
                headers: {'Content-Type': 'multipart/form-data'}
            });
            // console.log('data',data);
            await getCenter();
        }
    }

  return (
    <div>
        <Header/>
        <div className='wrap padding_120_0'>

            <div className="mypage-container">
            <h2 className='middle_title2'>센터 관리자 마이페이지</h2>
            <div className="mypage-profile">
                <img src={mainImage} alt="센터 대표 이미지" className="mypage-profile-img" />
                {editMode && (
                <label className="btn white_color label">
                    <FaCamera /> 대표이미지 변경
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleMainImageChange} />
                </label>
                )}
                 <div className="mypage-subimg-list">
                    {subImages?.map((img, idx) => (
                    <img key={idx} src={img} alt="센터 추가 이미지" style={{width:'100%'}} />
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
                    <span className="label font_weight_500">센터명</span>
                    <span className="label font_weight_400">{center.center_name}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">주소</span>
                    <span className="label font_weight_400">{center.address}</span>
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">연락처</span>
                    {editMode ? <input className='width_fit' defaultValue={center.phone} name='phone' value={center.phone} onChange={changeCenter}/> : <span className="label font_weight_400">{center.phone}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">소개</span>
                    {editMode ? <textarea className='width_fit' defaultValue={center.introduction} name='introduction' value={center.introduction} onChange={changeCenter}/> : <span className="label font_weight_400">{center.introduction}</span>}
                </div>
                <div className="mypage-profile-row">
                    <span className="label font_weight_500">태그</span>
                    {center.tags?.map((item,idx)=>{
                        return(<span key={idx} className="mypage_tag">{item}</span>);
                    })}
                </div>
                {/*<div className="mypage-profile-row"><span className="label font_weight_500">홈페이지</span><span className="label font_weight_400">{center.homepage}</span></div>*/}
                <div className="mypage-profile-row"><span className="label font_weight_500">운영시간</span><span className="label font_weight_400">{center.operation_hours}</span></div>
                {/*<div className="mypage-profile-row"><span className="label font_weight_500">주차</span><span className="label font_weight_400">{center.parking}</span></div>*/}
                {/*<div className="mypage-profile-row"><span className="label font_weight_500">위치</span><span className="label font_weight_400">({center.latitude},{center.longitude})</span></div>*/}
                {editMode ?
                <div className="mypage-profile-row position_rel">
                    <span className="label font_weight_500">비밀번호</span>
                    <input type={passwordVisible ? "text" : "password"} className='width_fit' defaultValue={center.password} name='password' value={center.password} onChange={changeCenter} />
                    <span className="material-symbols-outlined mypage_password_position" onClick={togglePasswordVisibility}>visibility</span>
                </div> : ''}
                <button className="btn white_color label mr_10" onClick={edit}>
                    <FaEdit /> {editMode ? '수정완료' : '정보수정'}
                </button>
                <button className="btn white_color label" onClick={() => setTagModalOpen(true)}>
                    <FaEdit /> 태그추가
                </button>
                </div>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaUser /> 소속 트레이너</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>이름</th><th>연락처</th><th>별점</th><th>프로필</th><th>관리</th></tr>
                </thead>
                <tbody>
                    {trainers?.map(t=>(
                    <tr key={t.trainer_id}>
                        <td>
                        <img src={`http://localhost/profileImg/profile/${t.trainer_id}`} alt="트레이너" style={{width:32,height:32,borderRadius:'50%',marginRight:8,verticalAlign:'middle'}} />
                        {t.name}
                        </td>
                        <td>{t.phone}</td>
                        <td>{t.rating}</td>
                        <td>
                        <button className="mypage-small-btn" onClick={()=>handleMoveTrainerDetail(t.trainer_idx)}>보기</button>
                        </td>
                        <td>
                        {/*<button className="mypage-small-btn mr_10"><FaEdit />수정</button>*/}
                        <button className="mypage-small-btn" onClick={()=>deleteTrainer(t.trainer_idx)}><FaTrash />삭제</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <button className="btn white_color label" onClick={findModal}><FaPlus /> 트레이너 추가</button>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 상품 관리</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>상품명</th><th>가격</th><th>할인율</th><th>관리</th></tr>
                </thead>
                <tbody>
                    {products?.map(p=>(
                    <tr key={p.product_idx}>
                        <td>{p.product_name}</td>
                        <td>{p.price.toLocaleString()}원</td>
                        <td>{p.discount_rate}%</td>
                        <td>
                        <button className="mypage-small-btn mr_10" onClick={handleMoveProduct}><FaEdit />수정</button>
                        {p.status === "1" ?
                            <button className="mypage-small-btn" onClick={()=>handleProductStaus(p.product_idx)}><FaTrash />비활성화</button>
                        :
                            <button className="mypage-small-btn" onClick={()=>handleProductStaus(p.product_idx)}><FaTrash />활성화</button>
                        }
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <button className="btn white_color label" onClick={handleMoveProduct}><FaPlus /> 상품 추가</button>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 예약자 명단</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원명</th><th>연락처</th><th>상품</th><th>날짜</th><th>시간</th><th>트레이너</th><th>상태</th></tr>
                </thead>
                <tbody>
                    {mockCenterReservations.map(r=>(
                    <tr key={r.reservation_idx}>
                        <td>{r.member_name}</td>
                        <td>{r.phone}</td>
                        <td>{r.product_name}</td>
                        <td>{r.date}</td>
                        <td>{r.start_time}~{r.end_time}</td>
                        <td>{r.trainer_name}</td>
                        <td>{r.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaStar /> 받은 리뷰</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>회원</th><th>별점</th><th>내용</th><th>작성일</th></tr>
                </thead>
                <tbody>
                    {mockCenterReviews.map(r=>(
                    <tr key={r.review_id}>
                        <td>{r.member_name}</td>
                        <td>{r.rating}</td>
                        <td>{r.content}</td>
                        <td>{r.date}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="mypage-section">
                <h4 className='label text_left font_weight_500'><FaCalendarAlt /> 센터 스케줄</h4>
                <table className="mypage-table">
                <thead>
                    <tr><th>일정명</th><th>시작</th><th>종료</th><th>구분</th></tr>
                </thead>
                <tbody>
                    {mockCenterSchedules.map(s=>(
                    <tr key={s.schedule_id}>
                        <td>{s.title}</td>
                        <td>{s.start_time}</td>
                        <td>{s.end_time}</td>
                        <td>{s.type}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <button className="btn white_color label" onClick={handleMoveCalendar}><FaPlus /> 일정 추가</button>
            </div>
            </div>
        </div>
        <TagModal open={tagModalOpen} onClose={tagModalClose} />
        <Footer/>
    </div>
  );
};

export default CenterMyPage;
