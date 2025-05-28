// CustomToolbar.js
import React from 'react';
import {ToolbarProps} from 'react-big-calendar';

const CustomToolbar = (props) => {
    // 기본 툴바 버튼 및 라벨
    const {label, onNavigate, localizer} = props;

    return (
        <div
            className="rbc-toolbar no_wrap"
            style={{
                position: 'relative'
            }}>
            <span className="rbc-btn-group">
                <button type="button" onClick={() => onNavigate('PREV')}>{localizer.messages.previous}</button>
                <button type="button" onClick={() => onNavigate('TODAY')}>{localizer.messages.today}</button>
                <button type="button" onClick={() => onNavigate('NEXT')}>{localizer.messages.next}</button>
            </span>
            <span className="rbc-toolbar-label flex_1">{label}</span>
            {/* 아래에 원하는 div 추가 */}
            <div className='width_fit flex column gap_3'>
                <p className='bg_2196f3 white_color event_setting'>일정</p>
                <p className='bg_e57373 white_color event_setting'>휴무</p>
                <p className='bg_ffd54f white_color event_setting'>예약</p>
            </div>
        </div>
    );
};

export default CustomToolbar;
