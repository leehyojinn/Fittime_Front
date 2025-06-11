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
            const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";

            if(!user_id){
                set({loading:false});
                return;
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const {data:idxRes} = await axios.post(`${apiUrl}/list/centerIdx`,{user_id});
            const center_idx = idxRes.center_idx;

            const {data:chartRes} = await axios.post(`${apiUrl}/list/chart`,{user_id, center_idx});

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


const levelMessages = {
  0: "블랙리스트 입니다. 접근이 제한됩니다.",
  1: "일반 회원 권한입니다.",
  2: "트레이너 권한입니다.",
  3: "센터 관리자 권한입니다.",
  4: "최고 관리자 권한입니다.",
};

export const useAuthStore = create((set, get) => ({
  // 인증 및 권한 체크
  isAuthenticated: (options = {}) => {
    const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : "";
    const user_level = typeof window !== "undefined" ? Number(sessionStorage.getItem("user_level")) : "";
    if (!user_id || !token) return false;

    // 게스트(0)만 차단, 일반회원(1) 이상 허용
    if (options.noGuest && user_level === 0) return false;

    // 특정 레벨만 허용 (기존 방식)
    if (options.requiredLevel !== undefined && user_level !== options.requiredLevel) return false;

    // 특정 레벨 이상 허용
    if (options.minLevel !== undefined && user_level < options.minLevel) return false;

    return true;
  },

  // 인증 및 권한 체크 + AlertModal + 리다이렉트
  checkAuthAndAlert: (router, customMsg, options = {}) => {
    const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : "";
    const user_level = typeof window !== "undefined" ? Number(sessionStorage.getItem("user_level")) : "";

    // 인증 체크
    if (!user_id || !token) {
      useAlertModalStore.getState().openModal({
        svg: "❗",
        msg1: "로그인 필요",
        msg2: customMsg || "로그인 정보가 없습니다.\n다시 로그인 해주세요.",
        showCancel: false,
        onConfirm: () => {
          router.replace("/component/login");
        },
      });
      return false;
    }

    // 게스트(0)만 차단
    if (options.noGuest && user_level === 0) {
      useAlertModalStore.getState().openModal({
        svg: "⛔",
        msg1: "권한 부족",
        msg2: levelMessages[user_level] || "블랙리스트는 접근할 수 없습니다.",
        showCancel: false,
        onConfirm: () => {
          router.replace("/");
        },
      });
      return false;
    }

    // 특정 레벨만 허용
    if (options.requiredLevel !== undefined && user_level !== options.requiredLevel) {
      useAlertModalStore.getState().openModal({
        svg: "⛔",
        msg1: "권한 부족",
        msg2: levelMessages[user_level] || "해당 페이지에 접근할 권한이 없습니다.",
        showCancel: false,
        onConfirm: () => {
          router.replace("/");
        },
      });
      return false;
    }

    // 특정 레벨 이상 허용
    if (options.minLevel !== undefined && user_level < options.minLevel) {
      useAlertModalStore.getState().openModal({
        svg: "⛔",
        msg1: "권한 부족",
        msg2: levelMessages[user_level] || "해당 페이지에 접근할 권한이 없습니다.",
        showCancel: false,
        onConfirm: () => {
          router.replace("/");
        },
      });
      return false;
    }

    return true;
  },

  getUserLevel: () => {
    return typeof window !== "undefined" ? Number(sessionStorage.getItem("user_level")) : "";
  },
}));
