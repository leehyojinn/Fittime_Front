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
