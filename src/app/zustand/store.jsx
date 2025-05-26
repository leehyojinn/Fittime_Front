import {create} from "zustand";

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