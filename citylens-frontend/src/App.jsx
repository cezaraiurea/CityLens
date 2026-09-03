import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';  
import QuizPage from './pages/QuizPage';
import PlanPage from './pages/PlanPage';
import SavedPage from './pages/SavedPage';
import ActiveTripPage from './pages/ActiveTripPage';
import ProtectedRoute from './components/ProtectedRoute';
import JournalPage from './pages/JournalPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminRoute from './components/AdmineRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
 
        <Route path="/login" element={<LoginPage />} /> 

        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> 
        <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
        <Route path="/active" element={<ProtectedRoute><ActiveTripPage /></ProtectedRoute>} />
        <Route path="/journal/:id" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;