import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SidebarLayout } from './components/SidebarLayout';

// View Components
import { DashboardView } from './components/DashboardView';
import { SchoolsView } from './components/SchoolsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { TeachersView } from './components/TeachersView';
import { StudentsView } from './components/StudentsView';
import { ParentsView } from './components/ParentsView';
import { ClassesView } from './components/ClassesView';
import { DailyReportForm } from './components/DailyReportForm';
import { DailyReportsView } from './components/DailyReportsView';
import { DevelopmentReportsView } from './components/DevelopmentReportsView';
import { AiReportGenerator } from './components/AiReportGenerator';
import { LearningLmsView } from './components/LearningLmsView';
import { MessagingView } from './components/MessagingView';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected App Routes wrapped inside SidebarLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/schools" element={<SchoolsView />} />
              <Route path="/subscriptions" element={<SubscriptionsView />} />
              <Route path="/teachers" element={<TeachersView />} />
              <Route path="/students" element={<StudentsView />} />
              <Route path="/portfolio" element={<StudentsView />} />
              <Route path="/parents" element={<ParentsView />} />
              <Route path="/classes" element={<ClassesView />} />
              <Route path="/daily-report" element={<DailyReportForm />} />
              <Route path="/daily-reports" element={<DailyReportsView />} />
              <Route path="/development" element={<DevelopmentReportsView />} />
              <Route path="/ai-generator" element={<AiReportGenerator />} />
              <Route path="/learning" element={<LearningLmsView />} />
              <Route path="/quizzes" element={<LearningLmsView />} />
              <Route path="/messaging" element={<MessagingView />} />
            </Route>
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
