'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header';
import Footer from '../../Footer';
import axios from 'axios';
import { useAlertModalStore, useAuthStore } from '@/app/zustand/store';
import AlertModal from '../alertmodal/page';
import { useRouter } from 'next/navigation';

const TagManagement = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('센터');
  const [editingTag, setEditingTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const {openModal} = useAlertModalStore();

  const router = useRouter();

  const checkAuthAndAlert = useAuthStore((state) => state.checkAuthAndAlert);

  useEffect(() => {
      checkAuthAndAlert(router, null, { minLevel: 4 });
  }, [checkAuthAndAlert, router]);

  // 태그 목록 불러오기
  const fetchTags = async (category = selectedCategory) => {
    setLoading(true);
    try {
      const { data } = await axios.post(apiUrl + '/' + 'tag_list', { category });
      setTags(data.list || []);
    } catch (e) {
      openModal({
        svg: '❗',
        msg1 : '오류',
        msg2 : '태그 목록을 불러오지 못했습니다.',
        showCancel : false
      })
    }
    setLoading(false);
  };

  // 카테고리 변경 시 태그 목록 새로고침
  useEffect(() => {
    fetchTags(selectedCategory);
    setEditingTag(null);
    reset({ category: selectedCategory, tag_name: '' });
    // eslint-disable-next-line
  }, [selectedCategory]);

  // 태그 추가/수정
  const onSubmit = async (data) => {
    if (editingTag) {
      // 수정
      try {
        const res = await axios.post(apiUrl + '/' + 'tag_update', {
          tag_idx: editingTag.tag_idx,
          tag_name: data.tag_name,
          category: data.category,
        });
        if (res.data.success) {
          fetchTags(data.category);
          setEditingTag(null);
          reset({ category: data.category, tag_name: '' });
          openModal({
            svg: '✔',
            msg1 : '확인',
            msg2 : '태그 수정에 성공하였습니다.',
            showCancel : false
          });
        } else {
          openModal({
            svg: '❗',
            msg1 : '오류',
            msg2 : '태그 수정에 실패했습니다.',
            showCancel : false
          })
        }
      } catch {
        openModal({
          svg: '❗',
          msg1 : '오류',
          msg2 : '태그 수정 중 오류가 발생했습니다.',
          showCancel : false
        })
      }
    } else {
      // 추가
      try {
        // 중복 검사 (프론트)
        if (tags.some(tag => tag.tag_name === data.tag_name)) {
          openModal({
            svg: '❗',
            msg1 : '중복',
            msg2 : '이미 존재하는 태그입니다.',
            showCancel : false
          });
          return;
        }
        const res = await axios.post(apiUrl + '/' + 'tag', {
          tag_name: data.tag_name,
          category: data.category,
        });
        if (res.data.success) {
          fetchTags(data.category);
          reset({ category: data.category, tag_name: '' });
          openModal({
            svg: '✔',
            msg1 : '확인',
            msg2 : '태그 등록에 성공하였습니다.',
            showCancel : false
          });
        } else {
          openModal({
            svg: '❗',
            msg1 : '오류',
            msg2 : '태그 등록에 실패했습니다.',
            showCancel : false
          })
        }
      } catch {
        openModal({
          svg: '❗',
          msg1 : '오류',
          msg2 : '태그 등록 중 오류가 발생했습니다.',
          showCancel : false
        })
        
      }
    }
  };

  const onError = (errors) => {
    if (errors.tag_name) {
      openModal({
        svg: '❗',
        msg1: '입력 오류',
        msg2: errors.tag_name.message,
        showCancel: false
      });
    }
  };

  // 태그 수정 버튼 클릭
  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setValue('category', tag.category);
    setValue('tag_name', tag.tag_name);
  };

  const alertModlaDelete = (tagToDelete) => {
    openModal({
      svg: '✔',
      msg1 : '확인',
      msg2 : '정말 해당 태그를 삭제하시겠습니까?',
      showCancel : true,
      onConfirm : () => handleDeleteTag(tagToDelete),
      onCancel: () => {},
    })
  }

  // 태그 삭제
  const handleDeleteTag = async (tagToDelete) => {
    try {
      const res = await axios.post(apiUrl + '/' + 'tag_del', { tag_idx: tagToDelete.tag_idx });
      if (res.data.success) {
        fetchTags(selectedCategory);
      } else {
        openModal({
          svg: '❗',
          msg1 : '오류',
          msg2 : '태그 삭제에 실패했습니다.',
          showCancel : false
        })
      }
    } catch {
      openModal({
        svg: '❗',
        msg1 : '오류',
        msg2 : '태그 삭제 중 오류가 발생했습니다.',
        showCancel : false
      })
    }
  };

  // 폼 취소
  const handleCancelEdit = () => {
    setEditingTag(null);
    reset({ category: selectedCategory, tag_name: '' });
  };

  return (
    <div>
      <Header/>
      <div className='flex justify_con_center padding_120_0 bg_primary_color_2'>
        <p className='title'>태그 등록 페이지</p>
      </div>
      <div className='wrap padding_120_0'>
        <div className="tag-management-container">
          <h2 className="page-title">태그 관리</h2>
          
          <div className="category-filter">
            <label className='label'>카테고리 : </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
              style={{width:'300px'}}
            >
              <option value="센터">센터</option>
              <option value="트레이너">트레이너</option>
            </select>
          </div>
          
          <form className="tag-form" onSubmit={handleSubmit(onSubmit, onError)}>
            <h3 className='middle_title2 mb_20'>{editingTag ? '태그 수정' : '태그 추가'}</h3>
            <div>
              <div className="form-group">
                <label htmlFor="category" className='label font_weight_500'>카테고리</label>
                <select 
                  id="category"
                  style={{width:'100%'}}
                  {...register("category", { required: "카테고리를 선택해주세요" })}
                  defaultValue={editingTag?.category || selectedCategory}
                  disabled={!!editingTag} // 수정 시 카테고리 변경 불가
                >
                  <option value="센터">센터</option>
                  <option value="트레이너">트레이너</option>
                </select>
                {errors.category && <span className="error-message">{errors.category.message}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="tag_name" className='label font_weight_500'>태그 이름</label>
                <input 
                  id="tag_name"
                  type="text"
                  {...register("tag_name", { 
                    required: "태그 이름을 입력해주세요",
                    maxLength: { value: 20, message: "태그 이름은 20자 이내로 입력해주세요" }
                  })}
                />
              </div>
              
              <div className="form-buttons flex gap_10 justify_con_center">
                <button type="submit" className="btn label white_color" disabled={loading}>
                  {editingTag ? '태그 수정' : '태그 추가'}
                </button>
                {editingTag && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="btn white_color label"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          </form>
          
          <div className="tags-list">
            <h3 className='middle_title2 mb_20'>{selectedCategory} 태그 목록</h3>
            {loading ? (
              <div>불러오는 중...</div>
            ) : (
              <table className="tags-table">
                <thead>
                  <tr>
                    <th className='label font_weight_500'>태그 이름</th>
                    <th className='label font_weight_500'>카테고리</th>
                    <th className='label font_weight_500'>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.tag_idx}>
                      <td className='label font_weight_400'>{tag.tag_name}</td>
                      <td className='label font_weight_400'>{tag.category}</td>
                      <td className='flex gap_10 justify_con_center'>
                        <button 
                          onClick={() => handleEditTag(tag)} 
                          className="btn label white_color"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => alertModlaDelete(tag)} 
                          className="delete-button label"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tags.length === 0 && (
                    <tr>
                      <td colSpan={3}>태그가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer/>
      <AlertModal/>
    </div>
  );
};

export default TagManagement;
