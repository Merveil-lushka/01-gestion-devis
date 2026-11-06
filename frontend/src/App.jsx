import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import NewDevis from './pages/NewDevis';
import EditDevis from './pages/EditDevis';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Route réservée à l'admin
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Page de connexion */}
            <Route path="/login" element={<Login />} />
            
            {/* Tableau de bord */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Page de création d'un nouveau devis */}
            <Route path="/devis/nouveau" element={
              <ProtectedRoute>
                <NewDevis />
              </ProtectedRoute>
            } />

            {/* Page d'administration des utilisateurs */}
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/devis/:id/modifier" element={
              <ProtectedRoute>
                <EditDevis />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;