'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

export default function KakaoPaySuccessPage() {
  const searchParams = useSearchParams();
  const pg_token = searchParams.get('pg_token');
  const tid = typeof window !== "undefined" ? window.localStorage.getItem("kakao_tid") : null;
  // 예약 정보 불러오기
  const bookingParam = typeof window !== "undefined"
    ? JSON.parse(window.localStorage.getItem("booking_param") || "{}")
    : {};

  const [resultMsg, setResultMsg] = useState('결제 승인 처리 중...');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!pg_token || !tid || done) return;
    setDone(true);
    // POST로 예약 정보와 함께 결제 승인 요청
    axios.post(
      `http://localhost/kakaopay/success?tid=${tid}&pg_token=${pg_token}`,
      bookingParam,
      { headers: { 'Content-Type': 'application/json' } }
    )
      .then(res => {
        if (res.data === 'success') {
          setResultMsg('결제 및 예약이 완료되었습니다!');
          if (window.opener && typeof window.opener.goToCompletionStep === 'function') {
            window.opener.goToCompletionStep();
          }
        } else {
          setResultMsg('결제 승인에 실패했습니다.');
        }
      })
      .catch(() => {
        setResultMsg('결제 승인에 실패했습니다.');
      });
  }, [pg_token, tid, done]);

  return (
    <div>
      <div className='padding_120_0 flex column gap_20 align_center'>
        <p className='middle_title'>{resultMsg}</p>
        <button
          className='btn label white_color'
          onClick={() => window.close()}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
