'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';
import AlertModal from '../alertmodal/page';
import { useAlertModalStore, useAuthStore } from '@/app/zustand/store';
import { useRouter } from 'next/navigation';

const Grant = () => {
  const { register, formState: { errors }, reset } = useForm();
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingUserId, setProcessingUserId] = useState(null);

  const openModal = useAlertModalStore((state) => state.openModal);

  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { minLevel: 4 });
    }, [checkAuthAndAlert, router]);

  // 권한명 매핑
  const LEVEL_LABELS = ['블랙리스트', '일반 회원', '트레이너', '센터 관리자', '사이트 관리자'];

  // 컴포넌트 마운트 시 LocalStorage에서 내역 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('adminGrantHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 히스토리 변경 시 LocalStorage에 저장
  useEffect(() => {
    localStorage.setItem('adminGrantHistory', JSON.stringify(history));
  }, [history]);

  // 검색 핸들러
  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearchResults([]);
      const { data } = await axios.post(`http://localhost/grant_search/${searchId}`);
      if (!data?.list?.length) {
        openModal({
          svg: '❗',
          msg1: '검색 실패',
          msg2: '사용자를 찾을 수 없습니다.',
          showCancel: false,
        });
        return;
      }
      setSearchResults(data.list);
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '검색 오류',
        msg2: '아이디를 입력해주세요.',
        showCancel: false,
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 권한 부여/해제 핸들러
  const handleToggleAdmin = async (user) => {
    if (!user) return;
    setProcessingUserId(user.user_id);
    try {
      const isGranting = user.user_level === 1;
      const endpoint = isGranting ? 'grant' : 'revoke';
      const { data } = await axios.post(`http://localhost/${endpoint}/${user.user_id}`);
      if (data.success) {
        const newLevel = isGranting ? 4 : 1;
        const newHistory = [
          {
            user_id: user.user_id,
            previous_level: user.user_level,
            new_level: newLevel,
          },
          ...history
        ];
        setHistory(newHistory);
        setSearchResults(results =>
          results.map(u =>
            u.user_id === user.user_id ? { ...u, user_level: newLevel } : u
          )
        );
      } else {
        openModal({
          svg: '❗',
          msg1: '권한 변경 실패',
          msg2: isGranting ? '권한 부여에 실패했습니다.' : '권한 해제에 실패했습니다.',
          showCancel: false,
        });
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '권한 변경 오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // 되돌리기 버튼 클릭 시 zustand로 모달 띄우기
  const handleRevertClick = (item) => {
    openModal({
      svg: '✔',
      msg1: "확인",
      msg2: "현재 권한을 지우고 되돌리시겠습니까?",
      showCancel: true,
      onConfirm: () => handleConfirmRevert(item),
      onCancel: () => {},
    });
  };

  // 권한 되돌리기 실행
  const handleConfirmRevert = async (selectedItem) => {
    if (!selectedItem) return;
    setProcessingUserId(selectedItem.user_id);
    try {
      const isRevertToAdmin = selectedItem.previous_level === 4;
      const endpoint = isRevertToAdmin ? 'grant' : 'revoke';
      const { data } = await axios.post(`http://localhost/${endpoint}/${selectedItem.user_id}`);
      if (data.success) {
        if (history.length === 0 || history[0].user_id === selectedItem.user_id) {
          setHistory([
            {
              user_id: selectedItem.user_id,
              previous_level: selectedItem.new_level,
              new_level: selectedItem.previous_level,
            },
            ...history
          ]);
        }
        setSearchResults(results =>
          results.map(u =>
            u.user_id === selectedItem.user_id ? { ...u, user_level: selectedItem.previous_level } : u
          )
        );
      } else {
        openModal({
          svg: '❗',
          msg1: '되돌리기 실패',
          msg2: '권한 되돌리기에 실패했습니다.',
          showCancel: false,
        });
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '되돌리기 오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const keyupHandler = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>관리자 권한 부여 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="admin-grant-container">
          <h2 className="page-title">관리자 권한 관리</h2>
          <div className="search-section">
            <div>
              <div className="flex gap_10 align_center">
                <label htmlFor="userId" className='label'>아이디 검색</label>
                <input
                  id="userId"
                  type="text"
                  {...register("userId", {
                    required: "아이디를 입력해주세요",
                    onChange: (e) => setSearchId(e.target.value)
                  })}
                  onKeyUp={keyupHandler}
                  className="form-control flex_1"
                />
                {errors.userId && (
                  <span className="error-message">{errors.userId.message}</span>
                )}
                <button
                  type="button"
                  className="btn label white_color"
                  disabled={loading}
                  onClick={handleSearch}
                >
                  {loading ? '검색 중...' : '검색'}
                </button>
              </div>
            </div>
          </div>

          {/* 검색 결과 리스트 */}
          {searchResults.length > 0 && (
            <div className="result-section">
              <h3 className='middle_title2 mb_20'>검색 결과</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th className='label font_weight_500'>아이디</th>
                    <th className='label font_weight_500'>이름</th>
                    <th className='label font_weight_500'>현재 권한</th>
                    <th className='label font_weight_500'>권한 변경</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((user) => (
                    <tr key={user.user_id}>
                      <td className='label font_weight_400'>{user.user_id}</td>
                      <td className='label font_weight_400'>{user.user_name || user.name}</td>
                      <td className='label font_weight_400'>{LEVEL_LABELS[user.user_level]}</td>
                      <td className='label font_weight_400'>
                        {user.user_level === 1 || user.user_level === 4 ? (
                          <button
                            className="btn label white_color"
                            disabled={processingUserId === user.user_id}
                            onClick={() => handleToggleAdmin(user)}
                          >
                            {processingUserId === user.user_id
                              ? '처리 중...'
                              : user.user_level === 4
                                ? '사이트 관리자 권한 해제'
                                : '사이트 관리자 권한 부여'}
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 변경 내역 테이블 */}
          <div className="history-section">
            <h3 className='middle_title2 mb_20'>권한 변경 내역</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th className='label font_weight_500'>아이디</th>
                  <th className='label font_weight_500'>이전 권한</th>
                  <th className='label font_weight_500'>변경 권한</th>
                  <th className='label font_weight_500'>되돌리기</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td className='label font_weight_400'>{item.user_id}</td>
                    <td className='label font_weight_400'>{LEVEL_LABELS[item.previous_level]}</td>
                    <td className='label font_weight_400'>{LEVEL_LABELS[item.new_level]}</td>
                    <td className='label font_weight_400'>
                      <button
                        className="btn white_color label"
                        disabled={processingUserId === item.user_id}
                        onClick={() => handleRevertClick(item)}>
                        {processingUserId === item.user_id ? '처리 중...' : '되돌리기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
      <AlertModal />
    </div>
  );
};

export default Grant;
