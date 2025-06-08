'use client'

import React, {useEffect, useRef, useState} from 'react';
import 'chartjs-adapter-date-fns';
import Footer from '../../Footer';
import Header from '../../Header';
import {useAlertModalStore, useAuthStore, useDashboardStore} from "@/app/zustand/store";
import {CircularProgress, Box, Typography} from "@mui/material";
import {Chart, registerables} from "chart.js";
import '../../globals.css';
import { useRouter } from 'next/navigation';

Chart.register(...registerables); // Chart.js 등록

const Dashboard = () => {
    const {centerIdx, chartData, loading, fetchDashboard} = useDashboardStore(); // zustand 에서 가져오기
    const {openModal} = useAlertModalStore();
    const [userLevel, setUserLevel] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isInit, setIsInit] = useState(false); // 사용자 정보 초기화 여부

    const [summaryData, setSummaryData] = useState(null);
    const [popularProducts, setPopularProducts] = useState([]);
    const [topTrainers, setTopTrainers] = useState([]);

    const monthlyRevenueChartRef = useRef(null);
    const monthlyReservationChartRef = useRef(null);
    const ratingChartRef = useRef(null);

    const [isClient, setIsClient] = useState(false);

    const router = useRouter();

    const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

    useEffect(() => {
        checkAuthAndAlert(router, null, { minLevel: 3 });
    }, [checkAuthAndAlert, router]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const levelStr = sessionStorage.getItem('user_level');
        const id = sessionStorage.getItem('user_id');
        const level = levelStr ? parseInt(levelStr, 10) : null;

        setUserLevel(level);
        setUserId(id);
        setIsInit(true);

        if (level === 3 && id) {
            fetchDashboard(); // centerIdx, chartData 처리
        }
    }, [fetchDashboard]);

    useEffect(() => {
        if (isInit) {
            if (isInit && !userId) {
                openModal({
                    svg: '❗',
                    msg1: '해당 페이지 접근 불가',
                    msg2: '로그인 후 이용해주세요.',
                    showCancel: false,
                });
            }else if (userLevel !== 3) {
                openModal({
                    svg: '⛔',
                    msg1: '해당 페이지 접근 불가',
                    msg2: '접근할 수 없는 계정입니다.',
                    showCancel: false,
                });
            }
        }
    }, [isInit, userId, userLevel]);

    useEffect(() => {
        if (!chartData) return;
        console.log("차트데이터 확인 : ",chartData);

            // 요약 정보 계산
            setSummaryData({
                reservations: chartData.bookData.reduce((sum, item) => sum + item.reservation_cnt, 0),
                members: chartData.memberData?.[0]?.center_member ?? 0,
                products: chartData.productData?.[0]?.product_cnt ?? 0,
                trainers: chartData.currentTrainerData?.[0]?.trainer_cnt ?? 0,
                revenue: chartData.currentSalesData?.[0]?.total_sales ?? 0
            });

            // 개별 데이터 저장 (차트/테이블용)
            setPopularProducts(chartData.productPopularData || []);
            setTopTrainers(chartData.trainerData?.map(d => ({
                user_name: d.trainer_name,
                count: d.reservation_cnt,
                rating: d.avg_rating,
                reviewCount: d.review_cnt
            })) || []);

            // 월별 매출 차트
            const monthlyRevenueChart = (rawData) => {
                const monthlyRevenueCtx = document.getElementById('monthlyRevenueChart');

                const labels = Array.from({length: 12}, (_, i) => `${String(i+1).padStart(2, '0')}월`);
                const monthlyCounts = Array(12).fill(0);

                rawData.forEach(d => {
                    const monthIndex = parseInt(d.sale_month?.split('-')[1],10)-1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyCounts[monthIndex] = d.total_sales;
                    }
                });

                if (monthlyRevenueCtx && !monthlyRevenueChartRef.current) {
                    monthlyRevenueChartRef.current = new Chart(monthlyRevenueCtx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: '월별 매출 (만원)',
                                data: monthlyCounts,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
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
            };

            // 월별 예약 수
            const monthlyReservationChart = (rawData) => {
                const monthlyReservationCtx = document.getElementById('monthlyReservationChart');

                const labels = Array.from({length: 12}, (_, i) => `${String(i+1).padStart(2, '0')}월`);

                const monthlyCounts = Array(12).fill(0);

                rawData.forEach(d => {
                    const monthIndex = parseInt(d.reservation_month?.split('-')[1],10)-1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyCounts[monthIndex] = d.reservation_cnt;
                    }
                });
                if (monthlyReservationCtx && !monthlyReservationChartRef.current) {
                    monthlyReservationChartRef.current = new Chart(monthlyReservationCtx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: '예약 건수',
                                data: monthlyCounts,
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
            };

            // 트레이너 평균 평점 차트
            const ratingChart = (data) => {
                const ratingChartCtx = document.getElementById('ratingChart');

                const ratingCounts = [0,0,0,0]; // 5점, 4.5~점, 4점~, 3.5점 이하

                data.forEach(d => {
                    const rating = parseFloat(d.avg_rating);
                    if (rating === 5.0) {
                        ratingCounts[0]++;
                    }else if (rating >= 4.5) {
                        ratingCounts[1]++;
                    }else if (rating >= 4.0) {
                        ratingCounts[2]++;
                    }else {
                        ratingCounts[3]++;
                    }
                });

                if (ratingChartCtx && !ratingChartRef.current) {
                    ratingChartRef.current = new Chart(ratingChartCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['5점', '4.5점', '4점', '3.5점 이하'],
                            datasets: [{
                                data: ratingCounts,
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
                            }
                        }
                    });
                }
            };
            // 차트 호출
            monthlyRevenueChart(chartData.salesData);
            monthlyReservationChart(chartData.bookData);
            ratingChart(chartData.trainerRatingData);

        // 재렌더 시 기존 차트 제거
        return () => {
            if (monthlyRevenueChartRef.current) {
                monthlyRevenueChartRef.current.destroy();
                monthlyRevenueChartRef.current = null;
            }
            if (monthlyReservationChartRef.current) {
                monthlyReservationChartRef.current.destroy();
                monthlyReservationChartRef.current = null;
            }
            if (ratingChartRef.current) {
                ratingChartRef.current.destroy();
                ratingChartRef.current = null;
            }
        };
    }, [chartData]);

    if (loading || !summaryData) { // 데이터 로딩 중일 때
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress/>
            </Box>
        );
    }

    if(!chartData){
        return (
            <Box textAlign="center" mt={4}>
                <Typography variant="h6">차트 데이터를 불러올 수 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <div>
            <Header/>
            <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
                <p className='title'>대시보드</p>
            </div>
            <div className='wrap padding_120_0'>

                <div className='dashboard-container'>

                    {/*요약 카드*/}
                    <div className='summary-cards'>
                        <div className='summary-card'>
                            <h3 style={{fontSize: '11px'}}>총 예약 수</h3>
                            <p className='summary-value'>{summaryData.reservations}건</p>
                        </div>
                        <div className='summary-card'>
                            <h3 style={{fontSize: '11px'}}>누적 회원 수</h3>
                            <p className='summary-value'>{summaryData.members}명</p>
                        </div>
                        <div className='summary-card'>
                            <h3 style={{fontSize: '11px'}}>등록된 상품 수</h3>
                            <p className='summary-value'>{summaryData.products}개</p>
                        </div>
                        <div className='summary-card'>
                            <h3 style={{fontSize: '11px'}}>총 트레이너 수</h3>
                            <p className='summary-value'>{summaryData.trainers}명</p>
                        </div>
                        <div className='summary-card'>
                            <h3 style={{fontSize: '11px'}}>이번 달 매출</h3>
                            <p className='summary-value'>{summaryData.revenue.toLocaleString()}원</p>
                        </div>
                    </div>

                    {/*차트 영역*/}
                    <div className='charts-container'>
                        <div className='chart-wrapper'>
                            <h3 style={{fontSize: '15px'}}>월별 매출</h3>
                            <div className='chart-box'>
                                <canvas id='monthlyRevenueChart'></canvas>
                            </div>
                        </div>
                        <div className='chart-wrapper'>
                            <h3 style={{fontSize: '15px'}}>월별 예약 수</h3>
                            <div className='chart-box'>
                                <canvas id='monthlyReservationChart'></canvas>
                            </div>
                        </div>
                        <div className='rating-chart-wrapper'>
                            <h3 style={{fontSize: '15px'}}>트레이너 별점 분포</h3>
                            <div className='rating-chart'>
                                <canvas id='ratingChart'></canvas>
                            </div>
                        </div>
                    </div>

                    {/*인기 상품*/}
                    <div className='data-rows'>
                        <div className='data-column'>
                            <h3 className='label font_weight_700 mb_20'>인기 상품</h3>
                            <table className='data-table'>
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
                                        <td>{product.sales_cnt}건</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='data-column'>
                            <h3 className='label font_weight_700 mb_20'>트레이너 통계</h3>
                            <table className='data-table'>
                                <thead>
                                <tr>
                                    <th>트레이너명</th>
                                    <th>예약 수</th>
                                    <th>평균 별점</th>
                                    <th>리뷰 수</th>
                                </tr>
                                </thead>
                                <tbody>
                                {topTrainers.map((trainer, index) => (
                                    <tr key={index}>
                                        <td>{trainer.user_name}</td>
                                        <td>{trainer.count}건</td>
                                        <td>{trainer.rating}점</td>
                                        <td>{trainer.reviewCount}개</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Dashboard;