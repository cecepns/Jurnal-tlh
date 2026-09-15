import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SidebarLayout } from './components/SidebarLayout';

// View Components
import { DashboardView } from './components/DashboardView';
import { CurriculumView } from './components/CurriculumView';
import { SignDictionaryView } from './components/SignDictionaryView';
import { DigitalLibraryView } from './components/DigitalLibraryView';
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
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Only - Authenticated users redirected to /dashboard */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected App Routes wrapped inside SidebarLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/curriculum" element={<CurriculumView />} />
              <Route path="/sign-dictionary" element={<SignDictionaryView />} />
              <Route path="/library" element={<DigitalLibraryView />} />
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
              <Route path="/lms-isyarat" element={<LearningLmsView defaultTab="learning" />} />
              <Route path="/lms-indonesia" element={<LearningLmsView defaultTab="learning" />} />
              <Route path="/learning" element={<LearningLmsView defaultTab="learning" />} />
              <Route path="/quizzes" element={<LearningLmsView defaultTab="quizzes" />} />
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
