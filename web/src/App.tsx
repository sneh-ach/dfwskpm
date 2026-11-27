import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { CalendarPage } from './pages/CalendarPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { SermonsPage } from './pages/SermonsPage'
import { DonatePage } from './pages/DonatePage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { MemberPage } from './pages/MemberPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminEvents } from './pages/admin/AdminEvents'
import { AdminNews } from './pages/admin/AdminNews'
import { AdminTeam } from './pages/admin/AdminTeam'
import { AdminResources } from './pages/admin/AdminResources'
import { AdminSchedule } from './pages/admin/AdminSchedule'
import { AdminHouseholds } from './pages/admin/AdminHouseholds'
import { AdminMemberLookup } from './pages/admin/AdminMemberLookup'
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements'
import { AdminBilling } from './pages/admin/AdminBilling'
import { AdminEmail } from './pages/admin/AdminEmail'
import { AdminMessages } from './pages/admin/AdminMessages'
import { AdminAccess } from './pages/admin/AdminAccess'
import { AdminSettings } from './pages/admin/AdminSettings'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="sermons" element={<SermonsPage />} />
          <Route path="donate" element={<DonatePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route
            path="member"
            element={
              <ProtectedRoute memberOnly>
                <MemberPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="admin"
          element={
            <ProtectedRoute staffOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route
            path="lookup"
            element={
              <ProtectedRoute adminOnly>
                <AdminMemberLookup />
              </ProtectedRoute>
            }
          />
          <Route
            path="households"
            element={
              <ProtectedRoute adminOnly>
                <AdminHouseholds />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing"
            element={
              <ProtectedRoute adminOnly>
                <AdminBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="email"
            element={
              <ProtectedRoute adminOnly>
                <AdminEmail />
              </ProtectedRoute>
            }
          />
          <Route path="team" element={<AdminTeam />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="resources" element={<AdminResources />} />
          <Route
            path="messages"
            element={
              <ProtectedRoute adminOnly>
                <AdminMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="access"
            element={
              <ProtectedRoute adminOnly>
                <AdminAccess />
              </ProtectedRoute>
            }
          />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
