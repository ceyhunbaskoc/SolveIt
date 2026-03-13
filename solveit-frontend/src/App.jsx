import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import MyIssues from './pages/MyIssues';
import Profile from './pages/Profile';
import Test from './pages/Test';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import MapPage from './pages/MapPage';
import { io } from 'socket.io-client';
import api from './utils/axios';
import toast from 'react-hot-toast';

// Socket connection
const socket = io('http://localhost:5000');

// Socket component
function SocketProvider({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user._id });
    }
  }, [user]);

  useEffect(() => {
    // Status güncelleme bildirimlerini dinle
    socket.on('statusUpdated', (data) => {
      console.log('Status updated:', data);
      
      // Eğer bildirim bu kullanıcıya aitse
      if (user && data.reporterId === user._id) {
        const statusText = data.status === 'RESOLVED' ? 'Çözüldü' : 
                          data.status === 'IN_PROGRESS' ? 'İnceleniyor' : 'Beklemede';
        
        toast.success(`Müjde! Sorununuz "${statusText}" olarak güncellendi! ${data.status === 'RESOLVED' ? '+20 XP kazandınız.' : ''}`, {
          duration: 6000,
          style: {
            background: '#10b981',
            color: '#fff',
          }
        });
      }
    });

    return () => {
      socket.off('statusUpdated');
    };
  }, [user]);

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test" element={<Test />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="report" element={<ReportIssue />} />
                <Route path="issues/:id" element={<IssueDetail />} />
                <Route path="my-issues" element={<MyIssues />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="map" element={<MapPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
