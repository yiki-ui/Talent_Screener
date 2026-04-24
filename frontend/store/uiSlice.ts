import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeView: 'table' | 'grid';
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  activeView: 'table',
  notification: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    setActiveView: (state, action: PayloadAction<'table' | 'grid'>) => {
      state.activeView = action.payload;
    },
    showNotification: (state, action: PayloadAction<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.notification = { open: true, message: action.payload.message, severity: action.payload.severity };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
  },
});

export const { toggleSidebar, closeSidebar, openSidebar, setActiveView, showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;
