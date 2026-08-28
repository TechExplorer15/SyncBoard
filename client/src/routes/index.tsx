/**
 * Application routes.
 * Public routes: /login, /register
 * Protected routes: / (dashboard), and future board/workspace routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import WorkspaceView from './WorkspaceView';
import BoardView from './BoardView';
import Landing from './Landing';
import ProtectedRoute from '../components/layout/ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/w/:workspaceId" element={<WorkspaceView />} />
          <Route path="/b/:boardId" element={<BoardView />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
