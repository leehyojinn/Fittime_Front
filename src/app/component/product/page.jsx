'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Footer from '../../Footer';
import Header from '../../Header';
import axios from 'axios';

const ProductManagement = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [error, setError] = useState('');

  // user_id를 sessionStorage에서 가져옴
  const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

  const serviceLevel = watch('service_level');

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    if (!user_id) return;
    try {
      const { data } = await axios.post(`http://localhost/product_list/${user_id}`);
      setProducts(data.list || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [user_id]);

  // 상품 등록
  const handleAddProduct = async (data) => {
    try {
      setError('');
      const req = {
        center_id: user_id,
        product_name: data.product_name,
        price: Number(data.price),
        discount_rate: Number(data.discount_rate),
        max_people: Number(data.max_count) || 0,
        service_level: Number(data.service_level),
        count: Number(data.count) || 0,
        expiration_period: Number(data.validity_period) || 0,
        status: 1
      };
      const { data: res } = await axios.post('http://localhost/product_insert', req);
      if (res.success) {
        fetchProducts();
        reset();
        setSelectedProduct(null);
        setIsEditing(false);
      } else {
        setError('상품 등록에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // 상품 선택 시 폼 채우기
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setIsEditing(false);
    setValue('product_name', product.product_name);
    setValue('price', product.price);
    setValue('discount_rate', product.discount_rate);
    setValue('max_count', product.max_people);
    setValue('service_level', product.service_level);
    setValue('count', product.count);
    setValue('validity_period', product.expiration_period);
  };

  // 수정 모드 진입
  const handleEditProduct = () => setIsEditing(true);

  // 상품 수정
  const handleUpdateProduct = async (data) => {
    try {
      setError('');
      const req = {
        product_name: data.product_name,
        price: Number(data.price),
        discount_rate: Number(data.discount_rate),
        max_people: Number(data.max_count) || 0,
        service_level: Number(data.service_level),
        count: Number(data.count) || 0,
        expiration_period: Number(data.validity_period) || 0,
      };
      const { data: res } = await axios.post(
        `http://localhost/product_update/${user_id}/${selectedProduct.product_idx}`,
        req
      );
      if (res.success) {
        fetchProducts();
        setIsEditing(false);
        setSelectedProduct(null);
        reset();
      } else {
        setError('상품 수정에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // 폼 리셋 및 등록모드 전환
  const handleFormReset = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    reset();
  };

  const getServiceLevelName = (level) => {
    switch (level) {
      case 1: return '자유출입 (헬스/복싱)';
      case 2: return '그룹 클래스 (수영/요가/크로스핏)';
      case 3: return '개인 운동 (PT/골프/필라테스)';
      default: return '미분류';
    }
  };

  // 상태 토글 핸들러
// 상태 토글 핸들러
const handleToggleStatus = async (product) => {
  try {
    setError('');
    const { data } = await axios.post(
      `http://localhost/product_status/${user_id}/${product.product_idx}`,
      {}
    );
    if (data.success) {
      // 로컬 상태 즉시 업데이트
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.product_idx === product.product_idx 
            ? { ...p, status: !p.status } 
            : p
        )
      );
    }
  } catch (err) {
    setError(err.response?.data?.message || err.message);
  }
};


  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>상품등록 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="product-management-container">
          <h2 className="page-title">
            상품 관리
          </h2>
            <button 
              className='btn label white_color'
              onClick={handleFormReset}
              type="button"
            >
              상품 등록
            </button>
          {error && <div className="error-message">{error}</div>}
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
                </select>
              </div>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>가격</th>
                    <th>할인율</th>
                    <th>수강인원</th>
                    <th>카테고리</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(product => serviceFilter === 'all' || product.service_level === Number(serviceFilter))
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
                          {product.max_people > 0 ? `${product.max_people}명` : '무제한'}
                        </td>
                        <td onClick={() => handleSelectProduct(product)}>
                          {getServiceLevelName(product.service_level)}
                        </td>
                        <td>
                          <button
                            className={`status-toggle ${product.status ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleStatus(product)}
                            type="button"
                            style={{
                              padding: "4px 12px",
                              background: product.status ? "#4CAF50" : "#ccc",
                              color: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              cursor: "pointer"
                            }}
                          >
                            {product.status ? "활성" : "비활성"}
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
              <form onSubmit={handleSubmit(selectedProduct && isEditing ? handleUpdateProduct : handleAddProduct)}>
                <div className="form-group">
                  <label htmlFor="product_name" className='label font_weight_500'>상품명</label>
                  <input 
                    id="product_name"
                    type="text"
                    {...register("product_name", { required: "상품명을 입력해주세요" })}
                    disabled={selectedProduct && !isEditing}
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
                  />
                  {errors.discount_rate && <span className="error-message">{errors.discount_rate.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="service_level" className='label font_weight_500'>운동 레벨</label>
                  <select 
                    id="service_level"
                    {...register("service_level", { required: "운동 레벨을 선택해주세요" })}
                    disabled={selectedProduct && !isEditing}
                    style={{width:'100%'}}
                  >
                    <option value="1">자유출입 (헬스/복싱)</option>
                    <option value="2">그룹 클래스 (수영/요가/크로스핏)</option>
                    <option value="3">개인 운동 (PT/골프/필라테스)</option>
                  </select>
                  {errors.service_level && <span className="error-message">{errors.service_level.message}</span>}
                </div>
                {(serviceLevel === '2' || serviceLevel === 2) && (
                  <div className="form-group">
                    <label htmlFor="max_count" className='label font_weight_500'>수강 인원 수</label>
                    <input 
                      id="max_count"
                      type="number"
                      {...register("max_count", { required: "수강 인원 수를 입력해주세요", min: 1 })}
                      disabled={selectedProduct && !isEditing}
                    />
                    {errors.max_count && <span className="error-message">{errors.max_count.message}</span>}
                  </div>
                )}
                {(serviceLevel === '3' || serviceLevel === 3) && (
                  <div className="form-group">
                    <label htmlFor="count" className='label font_weight_500'>횟수</label>
                    <input 
                      id="count"
                      type="number"
                      {...register("count", { required: "횟수를 입력해주세요", min: 1 })}
                      disabled={selectedProduct && !isEditing}
                    />
                    {errors.count && <span className="error-message">{errors.count.message}</span>}
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="validity_period" className='label font_weight_500'>유효 기간 (일)</label>
                  <input 
                    id="validity_period"
                    type="number"
                    {...register("validity_period", { required: "유효 기간을 입력해주세요", min: 1 })}
                    disabled={selectedProduct && !isEditing}
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
      <Footer/>
    </div>
  );
};

export default ProductManagement;
