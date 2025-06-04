'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Footer from '../../Footer';
import Header from '../../Header';
import axios from 'axios';
import AlertModal from '../alertmodal/page';
import { useAlertModalStore } from '@/app/zustand/store';

const ProductManagement = () => {
  const [exerciseLevel, setExerciseLevel] = useState('');
  const [isReady, setIsReady] = useState(false);

  const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

  const { register, handleSubmit, formState: { errors }, reset, setFocus, watch } = useForm({
    defaultValues: {
      service_level: ''
    }
  });

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const { openModal } = useAlertModalStore();
  const serviceLevel = watch('service_level');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const level = sessionStorage.getItem("exercise_level") || "";
      setExerciseLevel(level);
      setIsReady(true);
      reset({ service_level: level });
    }
  }, [reset]);

  useEffect(() => {
    if (isReady && !exerciseLevel) {
      openModal({
        svg: '❗',
        msg1: '운동 레벨 정보 없음',
        msg2: '센터 정보 페이지로 이동합니다.',
        showCancel: false,
        onConfirm: () => { window.location.href = '/component/centermypage'; }
      });
    }
  }, [exerciseLevel, isReady, openModal]);

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    if (!user_id) return;
    try {
      const { data } = await axios.post(`http://localhost/list/product`, { center_id: user_id });
      setProducts(data.products || []);
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    }
  };
  useEffect(() => { fetchProducts(); }, [user_id]);

  // 인풋 미입력시 AlertModal로 안내
  const onError = (formErrors) => {
    const firstErrorField = Object.keys(formErrors)[0];
    if (firstErrorField) {
      openModal({
        svg: '❗',
        msg1: '입력 오류',
        msg2: formErrors[firstErrorField].message,
        showCancel: false,
        onConfirm: () => setFocus(firstErrorField)
      });
    }
  };

  // 상품 등록
  const handleAddProduct = async (data) => {
    try {
      const req = {
        center_id: user_id,
        product_name: data.product_name,
        price: Number(data.price),
        discount_rate: Number(data.discount_rate),
        expiration_period: Number(data.validity_period) || 0,
        status: "1",
        max_people: Number(data.max_people) || 0, // 항상 포함
      };
      if (data.service_level === "1" || data.service_level === 1) {
        req.duration = Number(data.duration) || 0;
      }
      if (data.service_level === "2" || data.service_level === 2) {
        req.max_people = Number(data.max_people) || 0;
      }
      if (data.service_level === "3" || data.service_level === 3) {
        req.count = Number(data.count) || 0;
      }
      req.exercise_level = Number(data.service_level);

      const { data: res } = await axios.post('http://localhost/insert/product', req);
      if (res.success) {
        fetchProducts();
        reset({ service_level: exerciseLevel });
        setSelectedProduct(null);
        setIsEditing(false);
        openModal({
          svg: '✔',
          msg1: '등록 완료',
          msg2: '상품이 등록되었습니다.',
          showCancel: false,
        });
      } else {
        openModal({
          svg: '❗',
          msg1: '등록 실패',
          msg2: '상품 등록에 실패했습니다.',
          showCancel: false,
        });
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    }
  };

  // 상품 선택 시 폼 채우기
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setIsEditing(false);
    reset({
      product_name: product.product_name,
      price: product.price,
      discount_rate: product.discount_rate,
      service_level: exerciseLevel,
      duration: product.duration,
      max_people: product.max_people,
      count: product.count,
      validity_period: product.expiration_period,
    });
  };

  // 수정 모드 진입
  const handleEditProduct = () => setIsEditing(true);

  // 상품 수정
  const handleUpdateProduct = async (data) => {
    try {
      const req = {
        product_idx: selectedProduct.product_idx,
        product_name: data.product_name,
        price: Number(data.price),
        max_people: Number(data.max_people) || 0, // 항상 포함
        discount_rate: Number(data.discount_rate),
        expiration_period: Number(data.validity_period) || 0,
      };
      if (data.service_level === "1" || data.service_level === 1) {
        req.duration = Number(data.duration) || 0;
      }
      if (data.service_level === "2" || data.service_level === 2) {
        req.max_people = Number(data.max_people) || 0;
      }
      if (data.service_level === "3" || data.service_level === 3) {
        req.count = Number(data.count) || 0;
      }
      req.exercise_level = Number(data.service_level);

      const { data: res } = await axios.post(
        `http://localhost/update/product`,
        req
      );
      if (res.success) {
        fetchProducts();
        setIsEditing(false);
        setSelectedProduct(null);
        reset({ service_level: exerciseLevel });
        openModal({
          svg: '✔',
          msg1: '수정 완료',
          msg2: '상품이 수정되었습니다.',
          showCancel: false,
        });
      } else {
        openModal({
          svg: '❗',
          msg1: '수정 실패',
          msg2: '상품 수정에 실패했습니다.',
          showCancel: false,
        });
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    }
  };

  // 상품 삭제
  const handleDeleteProduct = (product_idx) => {
    openModal({
      svg: '❓',
      msg1: '삭제 확인',
      msg2: '정말로 이 상품을 삭제하시겠습니까?',
      showCancel: true,
      onConfirm: async () => {
        try {
          const { data } = await axios.post(`http://localhost/del/product/${product_idx}`);
          if (data.success) {
            fetchProducts();
            setSelectedProduct(null);
            reset({ service_level: exerciseLevel });
            openModal({
              svg: '✔',
              msg1: '삭제 완료',
              msg2: '상품이 삭제되었습니다.',
              showCancel: false,
            });
          } else {
            openModal({
              svg: '❗',
              msg1: '삭제 실패',
              msg2: '상품 삭제에 실패했습니다.',
              showCancel: false,
            });
          }
        } catch (err) {
          openModal({
            svg: '❗',
            msg1: '오류',
            msg2: err.response?.data?.message || err.message,
            showCancel: false,
          });
        }
      }
    });
  };

  // 상태 토글 핸들러 (활성/비활성)
  const handleToggleStatus = async (product) => {
    try {
      const { data } = await axios.get(
        `http://localhost/update/productStatus/${product.product_idx}`
      );
      if (data.success) {
        fetchProducts();
        openModal({
          svg: '✔',
          msg1: '상태 변경',
          msg2: '상태가 변경되었습니다.',
          showCancel: false,
        });
      }
    } catch (err) {
      openModal({
        svg: '❗',
        msg1: '오류',
        msg2: err.response?.data?.message || err.message,
        showCancel: false,
      });
    }
  };

  // 폼 리셋 및 등록모드 전환
  const handleFormReset = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    reset({ service_level: exerciseLevel });
  };

  // 운동레벨 옵션 동적 렌더링
  const renderServiceLevelOptions = () => {
    if (!isReady) return <option value="">운동레벨 없음</option>;
    if (!exerciseLevel) return <option value="">운동레벨 없음</option>;
    if (exerciseLevel === "1" || exerciseLevel === 1)
      return <option value="1">자유출입 (헬스/복싱)</option>;
    if (exerciseLevel === "2" || exerciseLevel === 2)
      return <option value="2">그룹 클래스 (수영/요가/크로스핏)</option>;
    if (exerciseLevel === "3" || exerciseLevel === 3)
      return <option value="3">개인 운동 (PT/골프/필라테스)</option>;
    if (exerciseLevel === "4" || exerciseLevel === 4)
      return (
        <>
          <option value="1">자유출입 (헬스/복싱)</option>
          <option value="3">개인 운동 (PT/골프/필라테스)</option>
        </>
      );
    return (
      <>
        <option value="1">자유출입 (헬스/복싱)</option>
        <option value="2">그룹 클래스 (수영/요가/크로스핏)</option>
        <option value="3">개인 운동 (PT/골프/필라테스)</option>
        <option value="4">헬스장</option>
      </>
    );
  };

  // 운동레벨별 필드 노출 + max_people 항상 노출
  const renderLevelSpecificFields = () => {
    const level = serviceLevel || exerciseLevel;
    return (
      <>
        {(level === '1' || level === 1) && (
          <div className="form-group">
            <label htmlFor="duration" className='label font_weight_500'>이용 기간(일)</label>
            <input
              id="duration"
              type="number"
              {...register("duration", { required: "이용 기간을 입력해주세요", min: 1 })}
              disabled={selectedProduct && !isEditing}
              style={errors.duration ? { border: '2px solid red' } : {}}
            />
            {errors.duration && <span className="error-message">{errors.duration.message}</span>}
          </div>
        )}
        {(level === '3' || level === 3) && (
          <div className="form-group">
            <label htmlFor="count" className='label font_weight_500'>횟수</label>
            <input
              id="count"
              type="number"
              {...register("count", { required: "횟수를 입력해주세요", min: 1 })}
              disabled={selectedProduct && !isEditing}
              style={errors.count ? { border: '2px solid red' } : {}}
            />
            {errors.count && <span className="error-message">{errors.count.message}</span>}
          </div>
        )}
        {/* max_people은 항상 노출 */}
        <div className="form-group">
          <label htmlFor="max_people" className='label font_weight_500'>수강 인원 수</label>
          <input
            id="max_people"
            type="number"
            {...register("max_people", { required: "수강 인원 수를 입력해주세요", min: 1 })}
            disabled={selectedProduct && !isEditing}
            style={errors.max_people ? { border: '2px solid red' } : {}}
          />
          {errors.max_people && <span className="error-message">{errors.max_people.message}</span>}
        </div>
      </>
    );
  };

  const getServiceLevelName = (level) => {
    const realLevel = level || exerciseLevel;
    switch (Number(realLevel)) {
      case 1: return '자유출입 (헬스/복싱)';
      case 2: return '그룹 클래스 (수영/요가/크로스핏)';
      case 3: return '개인 운동 (PT/골프/필라테스)';
      case 4: return '헬스장';
      default: return '미분류';
    }
  };

  if (!isReady) return null;

  return (
    <div>
      <Header />
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>상품등록 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="product-management-container">
          <h2 className="page-title">상품 관리</h2>
          <button
            className='btn label white_color'
            onClick={handleFormReset}
            type="button"
          >
            상품 등록
          </button>
          <div className="product-layout">
            <div className="product-list-section">
              <div className="filter-controls">
                <label>운동 레벨 필터:</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="service-filter"
                >
                  <option value="all">전체</option>
                  <option value="1">자유출입 (헬스/복싱)</option>
                  <option value="2">그룹 클래스 (수영/요가/크로스핏)</option>
                  <option value="3">개인 운동 (PT/골프/필라테스)</option>
                  <option value="4">헬스장</option>
                </select>
              </div>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>가격</th>
                    <th>할인율</th>
                    <th>수강인원</th>
                    <th>기간/횟수</th>
                    <th>카테고리</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(product => serviceFilter === 'all' || String(product.exercise_level || exerciseLevel) === String(serviceFilter))
                    .map((product) => (
                      <tr
                        key={product.product_idx}
                        className={selectedProduct?.product_idx === product.product_idx ? 'selected' : ''}
                      >
                        <td onClick={() => handleSelectProduct(product)}>
                          {product.product_name}
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {product.price?.toLocaleString()}원
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {product.discount_rate}%
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {product.max_people}명
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {product.duration ? `${product.duration}일` : product.count ? `${product.count}회` : '-'}
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {getServiceLevelName(product.exercise_level)}
                        </td>
                        <td>
                          <button
                            className={`status-toggle ${product.status === "1" ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleStatus(product)}
                            type="button"
                            style={{
                              padding: "4px 12px",
                              background: product.status === "1" ? "#4CAF50" : "#ccc",
                              color: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              cursor: "pointer",
                              marginRight: "8px"
                            }}
                          >
                            {product.status === "1" ? "활성" : "비활성"}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteProduct(product.product_idx)}
                            type="button"
                            style={{
                              padding: "4px 12px",
                              background: "#e74c3c",
                              color: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              cursor: "pointer"
                            }}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="product-form-section">
              <h3 className='middle_title2 mb_20'>
                {selectedProduct
                  ? (isEditing ? '상품 수정' : '상품 상세')
                  : '새 상품 등록'}
              </h3>
              <form onSubmit={handleSubmit(
                selectedProduct && isEditing ? handleUpdateProduct : handleAddProduct,
                onError
              )}>
                <div className="form-group">
                  <label htmlFor="product_name" className='label font_weight_500'>상품명</label>
                  <input
                    id="product_name"
                    type="text"
                    {...register("product_name", { required: "상품명을 입력해주세요" })}
                    disabled={selectedProduct && !isEditing}
                    style={errors.product_name ? { border: '2px solid red' } : {}}
                  />
                  {errors.product_name && <span className="error-message">{errors.product_name.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="price" className='label font_weight_500'>가격</label>
                  <input
                    id="price"
                    type="number"
                    {...register("price", { required: "가격을 입력해주세요", min: 0 })}
                    disabled={selectedProduct && !isEditing}
                    style={errors.price ? { border: '2px solid red' } : {}}
                  />
                  {errors.price && <span className="error-message">{errors.price.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="discount_rate" className='label font_weight_500'>할인율 (%)</label>
                  <input
                    id="discount_rate"
                    type="number"
                    {...register("discount_rate", { required: "할인율을 입력해주세요", min: 0, max: 100 })}
                    disabled={selectedProduct && !isEditing}
                    style={errors.discount_rate ? { border: '2px solid red' } : {}}
                  />
                  {errors.discount_rate && <span className="error-message">{errors.discount_rate.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="service_level" className='label font_weight_500'>운동 레벨</label>
                  <select
                    id="service_level"
                    {...register("service_level", { required: "운동 레벨을 선택해주세요" })}
                    disabled={selectedProduct && !isEditing}
                    style={{ width: '100%', ...(errors.service_level ? { border: '2px solid red' } : {}) }}
                  >
                    {renderServiceLevelOptions()}
                  </select>
                  {errors.service_level && <span className="error-message">{errors.service_level.message}</span>}
                </div>
                {renderLevelSpecificFields()}
                <div className="form-group">
                  <label htmlFor="validity_period" className='label font_weight_500'>유효 기간 (일)</label>
                  <input
                    id="validity_period"
                    type="number"
                    {...register("validity_period", { required: "유효 기간을 입력해주세요", min: 1 })}
                    disabled={selectedProduct && !isEditing}
                    style={errors.validity_period ? { border: '2px solid red' } : {}}
                  />
                  {errors.validity_period && <span className="error-message">{errors.validity_period.message}</span>}
                </div>
                <div className="form-buttons">
                  {!selectedProduct && (
                    <button type="submit" className="btn label white_color margin_0_auto">상품 등록</button>
                  )}
                  {selectedProduct && !isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handleEditProduct}
                        className="btn label white_color"
                      >
                        수정하기
                      </button>
                      <button
                        type="button"
                        onClick={handleFormReset}
                        className="btn label white_color"
                      >
                        새 상품 등록
                      </button>
                    </>
                  )}
                  {selectedProduct && isEditing && (
                    <>
                      <button type="submit" className="save-button">저장하기</button>
                      <button
                        type="button"
                        onClick={handleFormReset}
                        className="cancel-button"
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <AlertModal />
    </div>
  );
};

export default ProductManagement;
