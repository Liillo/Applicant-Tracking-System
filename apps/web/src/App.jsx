/**
 * HRMPEB ATS - Root App
 */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminGuard, ApplicantGuard, GuestGuard } from './components/Guards';

const Home = lazy(() => import('./pages/public/Home'));
const JobSearch = lazy(() => import('./pages/public/JobSearch'));
const JobDetails = lazy(() => import('./pages/public/JobDetails'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));

const ApplyNow = lazy(() => import('./pages/applicant/ApplyNow'));
const ApplicantDashboard = lazy(() => import('./pages/applicant/ApplicantDashboard'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminApplicationDetail = lazy(() => import('./pages/admin/AdminApplicationDetail'));

function RouteLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--clr-bg)',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          color: 'var(--clr-primary)',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: '3px solid rgba(31,60,136,0.15)',
            borderTopColor: 'var(--clr-primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--clr-muted)' }}>
          Loading page...
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              boxShadow: 'var(--shadow-lg)',
            },
            success: { style: { borderLeft: '4px solid var(--clr-green)' } },
            error: { style: { borderLeft: '4px solid var(--clr-red)' } },
          }}
        />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
            <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
            <Route path="/admin/login" element={<GuestGuard><AdminLogin /></GuestGuard>} />

            <Route path="/dashboard" element={<ApplicantGuard><ApplicantDashboard /></ApplicantGuard>} />
            <Route path="/apply/:jobId" element={<ApplicantGuard><ApplyNow /></ApplicantGuard>} />

            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/management" element={<AdminGuard><AdminManagement /></AdminGuard>} />
            <Route path="/admin/jobs/new" element={<AdminGuard><AdminManagement /></AdminGuard>} />
            <Route path="/admin/jobs/:id/edit" element={<AdminGuard><AdminManagement /></AdminGuard>} />
            <Route path="/admin/applications" element={<AdminGuard><AdminApplications /></AdminGuard>} />
            <Route path="/admin/applications/:id" element={<AdminGuard><AdminApplicationDetail /></AdminGuard>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
