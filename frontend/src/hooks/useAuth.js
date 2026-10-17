import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

export const useAuth = () => {
  const auth = useSelector(selectAuth);
  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role || '',
    loading: auth.loading,
    error: auth.error
  };
};

export default useAuth;
