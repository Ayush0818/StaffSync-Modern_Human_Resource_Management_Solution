import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If token exists in storage but user data is not yet in redux state, fetch user
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  return <AppRoutes />;
}

export default App;
