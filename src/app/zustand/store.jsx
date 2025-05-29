import {create} from "zustand";
import axios from "axios";

export const usePasswordStore = create((set) => ({
    passwordVisible: false,
    togglePasswordVisibility: () => set((state) => ({
        passwordVisible: !state.passwordVisible
    }))
}));

export const useSidebarStore = create((set) => ({
    isSidebarOpen: false,
    openSidebar: () => set({isSidebarOpen: true}),
    closeSidebar: () => set({isSidebarOpen: false}),
    toggleSidebar: () => set((state) => ({
        isSidebarOpen: !state.isSidebarOpen
    }))
}));

export const useAlertModalStore = create((set) => ({
  svg: null,
  isOpen: false,
  msg1: '',
  msg2: '',
  showCancel: false,
  onConfirm: null,
  onCancel: null,
  openModal: ({ svg = null, msg1, msg2, onConfirm, onCancel, showCancel = false }) =>
    set({
      svg,
      isOpen: true,
      msg1,
      msg2,
      onConfirm,
      onCancel,
      showCancel,
    }),
  closeModal: () =>
    set({
      svg: null,
      isOpen: false,
      msg1: '',
      msg2: '',
      onConfirm: null,
      onCancel: null,
      showCancel: false, // 항상 false로 리셋
    }),
}));

// 대시보드 상태
export const useDashboardStore = create((set) => ({
    centerIdx: null,
    chartData: {
        memberData: [],
        productData: [],
        currentTrainerData: [],
        currentSalesData: [],
        salesData: [],
        bookData: [],
        productSalesData: [],
        trainerBookData: [],
        trainerRatingData: [],
        productPopularData: [],
        trainerData: []
    },
    loading: false,
    fetchDashboard: async () => {
        set({loading:true});
        try {
            const user_id = sessionStorage.getItem('user_id');

            if(!user_id){
                set({loading:false});
                return;
            }

            const {data:idxRes} = await axios.post('http://localhost/list/centerIdx',{user_id});
            const center_idx = idxRes.center_idx;

            const {data:chartRes} = await axios.post('http://localhost/list/chart',{user_id, center_idx});

            set({
                centerIdx: center_idx,
                chartData: chartRes,
                loading: false,
            });
        }catch (err) {
            console.error("Dashboard fetch error:", err);
            set({ loading: false });
        }
    },
}));