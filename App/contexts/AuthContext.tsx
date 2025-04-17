// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react';
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';
// import { registerForPushNotificationsAsync } from '../utils/fcm';
// import { API_URL } from '@env';


// const TOKEN_KEY = 'user-jwt-token';

// interface AuthState {
//   token: string | null;
//   authenticated: boolean | null;
//   user?: any;
// }

// interface AuthContextType {
//   authState: AuthState;
//   onLogin: (username: string, password: string) => Promise<any>;
//   onLogout: () => Promise<void>;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType>({} as AuthContextType);
// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [authState, setAuthState] = useState<AuthState>({
//     token: null,
//     authenticated: null,
//     user: undefined,
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadToken = async () => {
//       const token = await SecureStore.getItemAsync(TOKEN_KEY);
//       if (token) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setAuthState({ token, authenticated: true });
//       } else {
//         setAuthState({ token: null, authenticated: false });
//       }
//       setLoading(false);
//     };

//     loadToken();
//   }, []);

//   const onLogin = async (username: string, password: string) => {
//     try {
//       setLoading(true);

//       const deviceToken = await registerForPushNotificationsAsync();
//       if (!deviceToken) throw new Error('FCM token not available');

//       const response = await axios.post(`${API_URL}/auth/login`, {
//         username,
//         password,
//         deviceToken,
//       });

//       const token = response.data.token;
//       const user = response.data.user;

//       setAuthState({ token, authenticated: true, user });
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       await SecureStore.setItemAsync(TOKEN_KEY, token);

//       return { success: true, user };
//     } catch (error: any) {
//       console.error('Login error:', error);
//       return {
//         error: true,
//         message:
//           error?.response?.data?.message || 'Login failed. Please try again.',
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onLogout = async () => {
//     await SecureStore.deleteItemAsync(TOKEN_KEY);
//     delete axios.defaults.headers.common['Authorization'];
//     setAuthState({ token: null, authenticated: false });
//   };

//   const value: AuthContextType = {
//     authState,
//     onLogin,
//     onLogout,
//     loading,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };


import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add real session check or AsyncStorage if needed
    setLoading(false);
  }, []);

  const loginUser = (role: string) => {
    setIsLoggedIn(true);
    setRole(role);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, role, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
