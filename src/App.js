
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
import Squad from './pages/Squad';
import Watchlist from './pages/Watchlist';
import FindScouts from './pages/FindScouts';
import MyScouts from './pages/MyScouts';
import AITalentFinder from './pages/AITalentFinder';
import BrowseClubs from './pages/BrowseClubs';
import ClubProfile from './pages/ClubProfile';
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
            path="/Analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/squad"
            element={
              <ProtectedRoute>
                <Squad />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-scouts"
            element={
              <ProtectedRoute>
                <FindScouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-scouts"
            element={
              <ProtectedRoute>
                <MyScouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-scout"
            element={
              <ProtectedRoute>
                <AITalentFinder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse-clubs"
            element={
              <ProtectedRoute>
                <BrowseClubs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs/:id"
            element={
              <ProtectedRoute>
                <ClubProfile />
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