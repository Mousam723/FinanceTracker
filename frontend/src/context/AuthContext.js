import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        // Clear the bad data so it doesn't cause issues again
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Also clear token if linked
        return null; // Return null if parsing fails
      }
    }
    return null;
  });

  const login = (userData) => {
    // userData from login.js will be { token: "...", message: "..." }
    localStorage.setItem('user', JSON.stringify(userData));
    // If you're also storing token separately, ensure it's handled here too if needed for other parts
    // localStorage.setItem('token', userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    // Optional: for debugging
    console.log("Auth Context User:", user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
