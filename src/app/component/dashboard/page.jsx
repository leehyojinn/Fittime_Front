'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import Footer from '../../Footer';
import Header from '../../Header';

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState({
    reservations: 152,
    members: 473,
    products: 8,
    trainers: 5,
    revenue: 4750000
  });
  
  const [mostPopularTime, setMostPopularTime] = useState([
    { time: '18:00', count: 45 },
    { time: '19:00', count: 52 },
    { time: '20:00', count: 38 },
    { time: '17:00', count: 35 },
    { time: '21:00', count: 30 }
  ]);
  
  const [popularProducts, setPopularProducts] = useState([
    { product_name: '1:1 PT 20회', count: 36 },
    { product_name: '3개월 회원권', count: 28 },
    { product_name: '필라테스 클래스', count: 24 },
    { product_name: '1개월 회원권', count: 21 },
    { product_name: '요가 클래스', count: 18 }
  ]);
  
  const [topTrainers, setTopTrainers] = useState([
    { user_name: '김트레이너', count: 24, rating: 4.8 },
    { user_name: '박트레이너', count: 19, rating: 4.7 },
    { user_name: '이트레이너', count: 18, rating: 4.9 },
    { user_name: '최트레이너', count: 15, rating: 4.5 },
    { user_name: '정트레이너', count: 10, rating: 4.6 }
  ]);
  
  const monthlyRevenueChartRef = useRef(null);
  const timeDistributionChartRef = useRef(null);
  const ratingChartRef = useRef(null);
  
  useEffect(() => {
    // 월별 매출 차트
    const monthlyRevenueCtx = document.getElementById('monthlyRevenueChart');
    if (monthlyRevenueCtx && !monthlyRevenueChartRef.current) {
      monthlyRevenueChartRef.current = new Chart(monthlyRevenueCtx, {
        type: 'bar',
        data: {
          labels: ['1월', '2월', '3월', '4월', '5월'],
          datasets: [{
            label: '월별 매출 (만원)',
            data: [320, 375, 410, 450, 475],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '매출 (만원)'
              }
            }
          }
        }
      });
    }
    
    // 시간대별 이용 분포 차트
    const timeDistributionCtx = document.getElementById('timeDistributionChart');
    if (timeDistributionCtx && !timeDistributionChartRef.current) {
      timeDistributionChartRef.current = new Chart(timeDistributionCtx, {
        type: 'line',
        data: {
          labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
          datasets: [{
            label: '예약 건수',
            data: [5, 8, 12, 15, 10, 7, 12, 18, 35, 45, 52, 38, 30],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '예약 건수'
              }
            }
          }
        }
      });
    }
    
    // 별점 분포 차트
    const ratingChartCtx = document.getElementById('ratingChart');
    if (ratingChartCtx && !ratingChartRef.current) {
      ratingChartRef.current = new Chart(ratingChartCtx, {
        type: 'doughnut',
        data: {
          labels: ['5점', '4.5점', '4점', '3.5점 이하'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: true,
              text: '리뷰 별점 분포'
            }
          }
        }
      });
    }
    
    return () => {
      if (monthlyRevenueChartRef.current) {
        monthlyRevenueChartRef.current.destroy();
        monthlyRevenueChartRef.current = null;
      }
      if (timeDistributionChartRef.current) {
        timeDistributionChartRef.current.destroy();
        timeDistributionChartRef.current = null;
      }
      if (ratingChartRef.current) {
        ratingChartRef.current.destroy();
        ratingChartRef.current = null;
      }
    };
  }, []);

  return (
    <div>
        <Header/>
        <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
          <p className='title'>대시보드</p>
        </div>
        <div className='wrap padding_120_0'>

            <div className="dashboard-container">
            <h2 className="page-title">대시보드</h2>
            
            <div className="summary-cards">
                <div className="summary-card">
                <h3>총 예약</h3>
                <p className="summary-value">{summaryData.reservations}건</p>
                </div>
                <div className="summary-card">
                <h3>회원 수</h3>
                <p className="summary-value">{summaryData.members}명</p>
                </div>
                <div className="summary-card">
                <h3>상품 수</h3>
                <p className="summary-value">{summaryData.products}개</p>
                </div>
                <div className="summary-card">
                <h3>트레이너</h3>
                <p className="summary-value">{summaryData.trainers}명</p>
                </div>
                <div className="summary-card revenue">
                <h3>이번 달 매출</h3>
                <p className="summary-value">{summaryData.revenue.toLocaleString()}원</p>
                </div>
            </div>
            
            <div className="charts-container">
                <div className="chart-wrapper">
                <h3>월별 매출</h3>
                <div className="chart-box">
                    <canvas id="monthlyRevenueChart"></canvas>
                </div>
                </div>
                
                <div className="chart-wrapper">
                <h3>시간대별 이용 분포</h3>
                <div className="chart-box">
                    <canvas id="timeDistributionChart"></canvas>
                </div>
                </div>
            </div>
            
            <div className="data-rows">
                <div className="data-column">
                <h3 className='label font_weight_700 mb_20'>인기 시간대</h3>
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>시간</th>
                        <th>예약 수</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mostPopularTime.map((item, index) => (
                        <tr key={index}>
                        <td>{item.time}</td>
                        <td>{item.count}건</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                
                <div className="data-column">
                <h3 className='label font_weight_700 mb_20'>인기 상품</h3>
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>상품명</th>
                        <th>판매량</th>
                    </tr>
                    </thead>
                    <tbody>
                    {popularProducts.map((product, index) => (
                        <tr key={index}>
                        <td>{product.product_name}</td>
                        <td>{product.count}건</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                
                <div className="data-column">
                <h3 className='label font_weight_700 mb_20'>트레이너 통계</h3>
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>예약 수</th>
                        <th>평균 별점</th>
                    </tr>
                    </thead>
                    <tbody>
                    {topTrainers.map((trainer, index) => (
                        <tr key={index}>
                        <td>{trainer.user_name}</td>
                        <td>{trainer.count}건</td>
                        <td>{trainer.rating.toFixed(1)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                
                <div className="data-column">
                <h3>별점 분포</h3>
                <div className="chart-box rating-chart">
                    <canvas id="ratingChart"></canvas>
                </div>
                </div>
            </div>
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default Dashboard;
