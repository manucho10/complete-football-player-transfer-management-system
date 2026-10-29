
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Messages from './pages/messages';
import Players from './pages/players';
import Transfers from './pages/Transfers';
import Notifications from './pages/Notifications';
import Settings from './pages/settings';
import PlayerProfile from './pages/PlayerProfile';
import Analytics from './pages/Analytics';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

// Placeholder pages

const Unauthorized = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl mb-4">Access Denied</h1>
      <p className="text-gray-400 mb-6">You don't have permission to view this page.</p>
      <a
        href="/dashboard"
        className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ============ PUBLIC ROUTES ============ */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />


          {/* ============ PROTECTED ROUTES ============ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>

            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <Players />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Transfers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* ============ ROLE-RESTRICTED ROUTES ============ */}

          {/* ============ UNAUTHORIZED PAGE ============ */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ============ ROLE-RESTRICTED (Example) ============ */}
          {/* Uncomment and create the page when ready */}
          {/* <Route
            path="/scout-tools"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutTools />
              </ProtectedRoute>
            }
          /> */}

          {/* ============ 404 FALLBACK ============ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;