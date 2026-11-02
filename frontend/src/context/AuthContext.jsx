import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Si on a un token au démarrage, on récupère les infos de l'utilisateur
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
      }).catch(() => {
        logout(); // Token invalide ou expiré
      });
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);