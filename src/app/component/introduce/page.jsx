'use client'
import React, {useState} from 'react';
import Modal from './Modal';
import Header from '../../Header';
import Footer from '../../Footer';

const teamMembers = [
    {
        id: 1,
        name: '이효진',
        position: '팀장 / 백엔드 개발 / 프론트 개발 / 퍼블리싱',
        image: '/이효진.png', 
        detail: `• 통괄`
    }, {
        id: 2,
        name: '이준혁',
        position: '백엔드 개발',
        image: '/이준혁.png',
        detail: `
        • ERD
        • 프로필 Back 작업
        • 검색 Back 작업`
    }, {
        id: 3,
        name: '김다의',
        position: '백엔드,프론트엔드 개발',
        image: '/김다의.png',
        detail: `
        • ERD
        • 로그인 Back 작업
        • 회원가입 Back 작업
        • 아이디/비밀번호 Back 작업
        `
    }, {
        id: 4,
        name: '김보연',
        position: '백엔드,프론트엔드 개발',
        image: '/김보연.png',
        detail: `
        • ERD
        • 리뷰 및 별점 Back 작업`
    }, {
        id: 5,
        name: '김동우',
        position: '백엔드,프론트엔드 개발',
        image: '/김동우.png',
        detail: `
        • ERD
        • 게시판 Back 작업`
    }
];

export default function Introduce() {
    const [selectedMember, setSelectedMember] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMemberClick = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    return (
        <div className="introduce-container">
            <Header/>

            <section className="padding_120_0">
                <div className='style_box'></div>
                <div className='wrap'>
                    <div className='mb_40 flex column gap_10'>
                        <h1 className="title">헬스장 통합 플랫폼 'fitTime'</h1>
                        <h2 className='middle_title'>왜 fitTime인가요?</h2>
                        <p className='content_text'>
                            본 프로젝트는 헬스장 예약과 리뷰 서비스를 통합적으로 제공하는 웹 플랫폼 구축을 목표로 하고 있습니다. 사용자는 전국 각지의 다양한 헬스장
                            정보를 한눈에 비교하고, 원하는 시간에 손쉽게 예약할 수 있습니다. 기존의 번거로운 전화 예약이나 현장 방문 없이, 온라인에서 실시간으로 남은
                            좌석과 이용 가능 시간을 확인할 수 있어 매우 편리합니다. 또한, 실제 이용자들의 리뷰와 평점을 통해 신뢰도 높은 정보를 얻을 수 있으며, 리뷰
                            작성 시 포인트 적립 등 다양한 인센티브도 제공됩니다.
                            <br/><br/>
                            헬스장 관리자는 별도의 관리자 페이지를 통해 예약 현황을 실시간으로 확인하고, 회원 관리, 시설 정보 수정, 이벤트 공지 등 다양한 업무를
                            효율적으로 처리할 수 있습니다. 본 서비스는 지도 기반 검색 기능, 필터링(가격, 위치, 시설 등), 추천 알고리즘, 즐겨찾기, 1:1 문의,
                            결제 연동 등 다양한 부가 기능도 함께 구현할 예정입니다.
                            <br/><br/>
                            프로젝트를 통해 사용자와 헬스장 모두에게 효율적이고 투명한 예약·리뷰 환경을 제공하고, 건강한 운동 문화 확산에 기여하는 것이 궁극적인
                            목표입니다. 실제로는 500개 이상의 제휴 헬스장을 목표로 하고 있지만, 프로젝트 단계에서는 샘플 데이터를 바탕으로 주요 기능 구현과 사용자
                            경험 개선에 집중할 계획입니다. 앞으로도 지속적인 피드백과 개선을 통해 더욱 완성도 높은 서비스를 만들어가겠습니다.
                        </p>
                    </div>
                    <div>
                        <h2 className='middle_title mb_20'>주요 기능</h2>
                        <ul className='flex column gap_10'>
                            <li className='label radius_text width_fit margin width_500 margin_0_auto'>실시간 헬스장 예약 및 취소 기능</li>
                            <li className='label radius_text width_fit margin width_500 margin_0_auto'>이용자 리뷰 및 평점 시스템</li>
                            <li className='label radius_text width_fit margin width_500 margin_0_auto'>지도 기반 헬스장 검색 및 필터링</li>
                            <li className='label radius_text width_fit margin width_500 margin_0_auto'>관리자용 예약/회원/시설 관리 페이지</li>
                            <li className='label radius_text width_fit margin width_500 margin_0_auto'>포인트 적립, 1:1 문의, 결제 연동 등 부가 서비스</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 팀 소개 섹션 (컬러 배경: 전체 100%) */}
            <div className='bg_primary_color_2'>
                <section className="padding_120_0">
                    <div className="wrap">
                        <h2 className="title mb_40">프로젝트 팀 구성</h2>
                        <div className="team-grid">
                            {
                                teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="team-card"
                                        onClick={() => handleMemberClick(member)}>
                                        <img src={member.image} alt={member.name} className="team_member_img"/>
                                        <h3 className='content_text'>{member.name}</h3>
                                        <p className='label'>{member.position}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </section>
            </div>

            {/* 모달 컴포넌트 */}
            {
                isModalOpen && (
                    <Modal onClose={() => setIsModalOpen(false)}>
                        <div style={{width:'100%'}} className="modal-content flex column gap_10 align_center">
                            <img
                                src={selectedMember.image}
                                alt={selectedMember.name}
                                className="modal-image width_fit"
                            />
                            <h2 className='middle_title'>{selectedMember.name}</h2>
                            <h3 className='label'>{selectedMember.position}</h3>
                            <div className="detail-box">
                                {
                                    selectedMember
                                        .detail
                                        .split('\n')
                                        .map((line, i) => (<p className='label' key={i}>{line}</p>))
                                }
                            </div>
                            <button
                                className="btn label white_color"
                                onClick={() => setIsModalOpen(false)}>
                                닫기
                            </button>
                        </div>
                    </Modal>
                )
            }

            <Footer/>
        </div>
    );
}
