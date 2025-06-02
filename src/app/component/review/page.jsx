'use client'
import React, {useState} from 'react';
import Header from "@/app/Header";
import {FaCamera, FaMapMarkerAlt, FaStar, FaPhoneAlt} from "react-icons/fa";
import Footer from "@/app/Footer";
import {useSearchParams} from "next/navigation";
import axios from "axios";
import KakaoMap from '../map/kakaomap';
import {useAlertModalStore} from '@/app/zustand/store';

const ReviewPage = () => {

    // 해야하는거 :/ 리뷰 리스트 / 삭제도...

    const [showMap, setShowMap] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const searchParams = useSearchParams();
    const centerId = searchParams.get('center_id');
    const trainerId = searchParams.get('trainer_id');
    const reservationIdx = searchParams.get('reservation_idx');
    const trainerName = searchParams.get('trainer_name');
    const centerName = searchParams.get('center_name');

    const [reviewTarget, setReviewTarget] = useState('');
    const [target, setTarget] = useState(centerId);
    const [targetName, setTargetName] = useState();
    const [reviewText, setReviewText] = useState('');
    const [star, setStar] = useState(0);
    const [hoverStar, setHoverStar] = useState(0);
    const [files, setFiles] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);

    const {openModal} = useAlertModalStore();

    // 별점 클릭/호버
    const handleStarClick = (value) => setStar(value);
    const handleStarHover = (value) => setHoverStar(value);
    const handleStarOut = () => setHoverStar(0);

    // 파일 업로드
    const handleFileChange = (e) => {
        const newFiles = Array
            .from(e.target.files)
            .slice(0, 5);
        setFiles(newFiles);
    };

    // 리뷰 등록
    const handleReviewSubmit = (e) => {
        e.preventDefault();
        // if (star < 0.5)     return alert('별점을 입력해주세요.'); if (reviewText.trim().length
        // < 15)     return alert('리뷰를 15자 이상 입력해주세요.'); if (files.some(f => f.size > 10
        // * 1024 * 1024))     return alert('각 이미지는 10MB 이하만 가능합니다.');
        if (star < 0.5) {
            openModal({svg: '★', msg1: '별점을 입력해주세요.', showCancel: false});
            return;
        }
        if (reviewText.trim().length < 15) {
            openModal({svg: '💬', msg1: '리뷰를 15자 이상 입력해주세요.', showCancel: false});
            return;
        }

        if (files.some(f => f.size > 10 * 1024 * 1024)) {
            openModal({svg: '❗', msg1: '각 이미지는 10MB 이하만 가능합니다.', showCancel: false});
            return;
        }
        setReviews({
            target_id: reviewTarget === 'trainer'
                ? trainerId
                : centerId,
            review_id: Date.now(),
            user_name: Date.now(),
            rating: star,
            content: reviewText,
            images: files.map(f => URL.createObjectURL(f))
        });
        insertReview();
    };

    // 별점 평균/참여인원
    const avgRating = reviews.list
        ?.length
            ? (reviews.list.reduce((sum, r) => sum + r.rating, 0) / reviews.list.length).toFixed(
                2
            )
            : '-';
    const insertReview = async () => {
        const formData = new FormData();
        if (files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }
        formData.append("user_id", sessionStorage.getItem('user_id'));
        formData.append("rating", star);
        formData.append("content", reviewText);
        formData.append("target_id", (
            reviewTarget === 'trainer'
                ? trainerId
                : centerId
        ));
        formData.append("target", reviewTarget);
        formData.append("reservation_idx", reservationIdx);

        console.log('reviewTarget:', reviewTarget);
        console.log('trainerId:', trainerId);
        console.log('centerId:', centerId);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }
        const {data} = await axios.post('http://localhost/insert/review', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('서버 응답 전체:', data);

        if (data.success) {
            setReviewText('');
            setStar(0);
            setFiles([]);
            setPage(1); // 페이지 초기화
            fetchReviews();
        }
    }

    const handleReviewTargetChange = (target) => {
        try {

            if (target === 'trainer') {
                setReviewTarget('trainer');
                setTarget(trainerId);
                setTargetName(trainerName);

            } else if (target === 'center') {
                setReviewTarget('center');
                setTarget(centerId);
                setTargetName(centerName);
            }

            setReviewText('');
            setStar(0);
            setFiles([]);
            setPage(1);

        } catch (e) {
            alert('작성된 리뷰가 없습니다');
        }

    };

    // 리뷰 목록 가져오기
    React.useEffect(() => {
        if (reservationIdx && target) {
            fetchReviews();
        }
    }, [reservationIdx, target, page]);

    const fetchReviews = async () => {
        const {data} = await axios.post(
            `http://localhost/list/review/0`,
            {reservation_idx: reservationIdx}
        );
        console.log(data);
        const allReviews = data.list || [];
        const relatedReviews = allReviews.filter(
            (review) => String(review.target_id) === target
        );
        setReviews({data, list: relatedReviews});
        console.log('필터링된 리뷰:', relatedReviews);
    };

    const filteredList = reviews.list
        ?.length
            ? reviews.list
            : [];

    // 지도 여닫 토글
    const handleToggleMap = () => {
        setShowMap(prev => !prev);
    };
    // 리뷰
    const handReviewForm = () => {
        if (!reviewTarget) {
            openModal({svg: '❗', msg1: '리뷰 대상을 선택해주세요', showCancel: false});
            return;
        }
        setShowReviewForm(prev => !prev);
    };

    const centerSample = {
        center_idx: 1,
        center_name: '헬스월드 강남점',
        address: '서울 강남구 역삼동 123-45',
        contact: '02-1234-5678',
        image: '/center1.jpg',
        intro: '이거 독재자 이준혁씨가 불러올거라던데여',
        tags: [
            '24시간', '샤워시설', '주차가능'
        ],
        rating: 4.7,
        reviews: [
            {
                review_id: 1,
                user_name: '회원A',
                rating: 5,
                content: 'db 및 백 독재 지렸따',
                date: '2025-05-01',
                images: []
            }, {
                review_id: 2,
                user_name: '회원B',
                rating: 4.5,
                content: '독재하는 사람도 연애를 하는데 .... ',
                date: '2025-05-02',
                images: []
            }
        ]
    };

    const reviewsPerPage = 10;
    const startIndex = (page - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const paginatedReviews = filteredList
        ?.slice(startIndex, endIndex);

    return (
        <div>
            <Header/>
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p
                    className='title'
                    onClick={() => handleReviewTargetChange(
                        target === target
                            ? centerId
                            : trainerId
                    )}>
                    {
                        target === trainerId
                            ? trainerName + ' 트레이너 님의 리뷰'
                            : centerName + ' 센터 리뷰'
                    }
                </p>
            </div>
            <div className='wrap padding_120_0'>
                <div className="center-detail-container">
                    <div className="center-header">
                        <img
                            src={centerSample.image}
                            alt={centerSample.center_name}
                            className="center-main-image"/>
                        <div className="center-header-info">
                            <h2>{centerSample.center_name}</h2>
                            <div className="center-tags">
                                {
                                    centerSample
                                        .tags
                                        .map(tag => <span key={tag} className="center-tag">{tag}</span>)
                                }
                            </div>
                            <div className="center-rating">
                                <FaStar/> {avgRating}
                                <span
                                    style={{
                                        fontSize: '0.92rem',
                                        color: '#888'
                                    }}>({reviews.length}명)</span>
                            </div>
                            <div className="center-contact">
                                <FaMapMarkerAlt/> {centerSample.address}
                                <span className="center-contact-phone"><FaPhoneAlt/> {centerSample.contact}</span>
                            </div>
                        </div>

                    </div>
                    <div>

                        <div className="center-intro">
                            <h4>센터 소개</h4>
                            <p>{centerSample.intro}</p>

                        </div>
                        {/* 지도 */}
                        {/* submit-button / cancel-button */}
                        <div>
                            <button
                                className='cancel-button'
                                onClick={handleToggleMap}
                                style={{
                                    marginBottom: '1rem'

                                }}>
                                {
                                    showMap
                                        ? '지도 닫기'
                                        : '위치 보기'
                                }
                            </button>
                            {
                                showMap && (
                                    <div>
                                        <KakaoMap Lat={37.570656845556} Lng={126.9930055114}/>
                                    </div>
                                )
                            }
                            <div>

                                <select
                                    className="review-toggle-select"
                                    value={reviewTarget}
                                    onChange={(e) => handleReviewTargetChange(e.target.value)}>
                                    <option value="">센터 / 트레이너</option>

                                    <option value="center">
                                        ✦ {centerName}
                                        ✦
                                    </option>
                                    <option value="trainer">
                                        ✦ {trainerName}
                                        ✦
                                    </option>
                                </select>

                            </div>
                            <div
                                style={{
                                    display: 'flex'
                                }}>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>

                                    <button
                                        onClick={handReviewForm}
                                        className={`review-toggle-small-btn ${showReviewForm
                                            ? 'active'
                                            : ''}`}>
                                        {
                                            showReviewForm
                                                ? reviewTarget === 'center'
                                                    ? '센터 리뷰 닫기'
                                                    : reviewTarget === 'trainer'
                                                        ? '트레이너 리뷰 닫기'
                                                        : '리뷰 닫기'
                                                : reviewTarget === 'center'
                                                    ? '센터 리뷰 작성'
                                                    : reviewTarget === 'trainer'
                                                        ? '트레이너 리뷰 작성'
                                                        : '리뷰를 작성 할 대상을 선택하세요'
                                        }
                                    </button>
                                </div>
                            </div>
                            {/* {
                                !showReviewForm && (
                                    <p className='review_insert_guide'>
                                        리뷰 작성 시 작성 하고자 하는 센터 혹은 트레이너를 선택해주십시오
                                    </p>
                                )
                            } */
                            }

                        </div>
                    </div>
                    {
                        showReviewForm && (
                            <div>

                                {/* 리뷰 작성 인풋 */}
                                <div className="trainer-review-write">
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="star-input">
                                            {
                                                [1, 2, 3, 4, 5].map(i => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            position: 'relative',
                                                            display: 'inline-block'
                                                        }}>
                                                        <FaStar
                                                            className="star"
                                                            color={(
                                                                (hoverStar || star) >= i)
                                                                ? '#444444'
                                                                : '#C0C6CC'}
                                                            onMouseEnter={() => handleStarHover(i)}
                                                            onMouseLeave={handleStarOut}
                                                            onClick={() => handleStarClick(i)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                fontSize: '2rem'
                                                            }}/> {/* 0.5점 지원 */}
                                                        <FaStar
                                                            className="star half"
                                                            color={(
                                                                (hoverStar || star) >= i - 0.5) && ((hoverStar || star) < i)
                                                                ? '#444444'
                                                                : 'transparent'}
                                                            style={{
                                                                cursor: 'pointer',
                                                                fontSize: '2rem',
                                                                position: 'absolute',
                                                                left: 0,
                                                                zIndex: 1,
                                                                clipPath: 'inset(0 50% 0 0)'
                                                            }}
                                                            onMouseEnter={() => handleStarHover(i - 0.5)}
                                                            onMouseLeave={handleStarOut}
                                                            onClick={() => handleStarClick(i - 0.5)}/>
                                                    </span>
                                                ))
                                            }
                                            <span className="star-score">{
                                                    star > 0
                                                        ? star
                                                        : ''
                                                }</span>
                                        </div>
                                        <textarea
                                            className="review-textarea"
                                            placeholder="센터 또는 트레이너에 대한 솔직한 후기를 남겨주세요. (15자 이상)"
                                            minLength={15}
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                            required="required"/>
                                        <div className="review-file-input">
                                            <label htmlFor="trainer-review-upload" className="file-label">
                                                <FaCamera/>
                                                <input
                                                    id="trainer-review-upload"
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    multiple="multiple"
                                                    onChange={handleFileChange}
                                                    style={{
                                                        display: 'none'
                                                    }}/>
                                            </label>
                                            <div className="review-file-preview">
                                                {
                                                    files
                                                        ?.map((file, i) => (<span key={i} className="file-name">{file.name}</span>))
                                                }
                                            </div>
                                            <button
                                                type="submit"
                                                className="review-submit-btn"
                                                onClick={handleReviewSubmit}>✔</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* 리뷰 리스트 */}
                    <div className='wrap padding_120_0'>

                        <div className="trainer-reviews">
                            <h4>리뷰</h4>
                            <ul>
                            {
    paginatedReviews?.map(r => (
      <li key={r.review_idx} className="review-item" style={{flexDirection:'column'}}>
        {/* 첫 줄: 작성자 + 별점 + 날짜 */}
        <div className="review-meta" style={{textAlign:'left', paddingLeft:'20px', paddingTop:'inherit'}}>
          <span className="review-user">{r.user_id}</span>
          <span className="review-rating"><FaStar/> {r.rating}</span>
          <span className="review-date">{r.date}</span>
        </div>

        {/* 둘째 줄: 내용 */}
        <div className="review-body" style={{textAlign:'left'}}>
          <span className="review-content" style={{paddingLeft:'30px'}}>{r.content}</span>
        
          {/* 이미지 */}
          {
            r.file_idx && r.file_idx.length > 0 && (
              <div className="review-images" style={{textAlign:'left', paddingLeft:'27px'}}>
                {
                  JSON.parse(r.file_idx).map((img, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost/reviewImg/${img}`}
                      alt="첨부"
                      style={{
                        width: 132,
                        height: 132,
                        objectFit: 'cover',
                        borderRadius: '1.4rem',
                        marginLeft: 4
                      }}
                    />
                  ))
                }
              </div>
            )
          }
        </div>
      </li>
    ))
  }
</ul>
                        </div>
                        <div className="pagination-buttons-fixed">
                            {
                                page > 1 && (
                                    <div>
                                        <button
                                            type="button"
                                            className="review-submit-btn-n"
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                                            이전 페이지
                                        </button>
                                    </div>
                                )
                            }
                        </div>

                        <div>
                            {
                                reviews.list && reviews.list.length === 10 && (
                                    <button onClick={() => setPage(prev => prev + 1)}>다음 페이지</button>
                                )
                            }
                        </div>

                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );

}

export default ReviewPage;
