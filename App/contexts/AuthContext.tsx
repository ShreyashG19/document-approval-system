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
