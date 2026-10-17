import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import managerReducer from './slices/managerSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import announcementReducer from './slices/announcementSlice';
import trainingReducer from './slices/trainingSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    managers: managerReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    announcements: announcementReducer,
    trainings: trainingReducer,
    notifications: notificationReducer
  }
});

export default store;
