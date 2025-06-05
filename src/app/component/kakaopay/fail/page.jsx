'use client'

import React from 'react'

export default function page() {
  return (
    <div>
      <div className='padding_120_0 flex column gap_20 align_center'>
        <p className='middle_title'>결제에 실패하였습니다.</p>
        <button
          className='btn label white_color'
          onClick={() => window.close()}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
