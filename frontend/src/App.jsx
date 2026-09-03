import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import AssetDetail from './pages/AssetDetail';
import DocumentSearch from './pages/DocumentSearch';
import AuditTrail from './pages/AuditTrail';
import UserManagement from './pages/UserManagement';
import CourtCaseDocuments from './pages/court/CourtCaseDocuments';
import ForensicWorkstation from './pages/forensic/ForensicWorkstation';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="spinner-block flex justify-center py-20">
        <div className="spinner" aria-label="Loading session" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="cases" element={<CaseList />} />
      <Route path="cases/:id" element={<CaseDetail />} />
      <Route path="assets/:id" element={<AssetDetail />} />
      <Route path="search" element={<DocumentSearch />} />
      <Route path="court/documents" element={<CourtCaseDocuments />} />
      <Route path="forensic" element={<ForensicWorkstation />} />
      <Route
        path="audit"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AuditTrail />
          </ProtectedRoute>
        }
      />
      <Route
        path="users"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
