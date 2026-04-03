/**
 * App — Root Application Component
 * 
 * Provider hierarchy: ThemeProvider → AuthProvider → BrowserRouter → Layout → Routes
 * 
 * Route structure:
 *   /                     — Landing page (public)
 *   /login, /register     — Auth pages (public)
 *   /dashboard            — User dashboard (protected)
 *   /course/:id           — Course detail / enrollment (protected)
 *   /course/:id/learn     — Course learning view with video modules (protected)
 *   /quiz/:id             — AI-generated quiz (protected)
 *   /profile              — User profile management (protected)
 *   /admin                — Admin dashboard with analytics (admin only)
 *   /purchase             — Post-payment success page
 *   /content              — PDF document management (protected)
 *   /content/:documentId  — AI content generation from PDF (protected)
 *   *                     — Catch-all redirect to /
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseLearnPage } from './pages/CourseLearnPage';
import { QuizPage } from './pages/QuizPage';
import { MyQuizzesPage } from './pages/MyQuizzesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PurchaseSuccessPage } from './pages/PurchaseSuccessPage';
import DocumentsPage from './pages/DocumentsPage';
import ContentGenerator from './pages/ContentGenerator';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course/:id/learn"
                element={
                  <ProtectedRoute>
                    <CourseLearnPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:id"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizes"
                element={
                  <ProtectedRoute>
                    <MyQuizzesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase"
                element={
                  <PurchaseSuccessPage />
                }
              />

              {/* Member 2 - AI Content Generation */}
              <Route
                path="/content"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content/:documentId"
                element={
                  <ProtectedRoute>
                    <ContentGenerator />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
