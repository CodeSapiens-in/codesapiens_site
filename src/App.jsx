import './index.css';
import React from 'react';
import {
  SessionContextProvider,
  useSession,
  useSessionContext,
  useUser,
} from '@supabase/auth-helpers-react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PageTransition from './components/PageTransition';
import AdminLayout from './components/AdminLayout';
import { Toaster } from 'react-hot-toast';



import Hero from './components/ui/Hero';
import Footer from './components/ui/Footer';
import AuthForm from './components/AuthForm';
import Dashboard from './pages/admin/Dashboard';
import UserProfile from './pages/user/UserProfile';
import UserDashboard from './pages/user/UserDashboard';
import NavBar from './components/NavBar';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import NotFoundPage from './components/ui/NotFoundPage';
import CodeSapiensHero from './components/CodeSapiensHero';
import AllUserList from './pages/admin/AllUserList';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'
import UserEvents from './pages/user/UserEvents';
import UserResource from './pages/user/UserResource';
import UserResumeBuilder from './pages/user/UserResumeBuilder';
import UserMentorshipForm from './pages/user/UserMentorshipForm';
import AdminMentorshipSubmission from './pages/admin/AdminMentorshipSubmission';
import PublicProfile from './pages/PublicProfile';
import UserPlayGround from './pages/user/UserPlayGround';
import UserMentorshipFormList from './pages/user/UserMentorshipFormList';
import UserCodingPlatform from './pages/user/UserCodingPlatform';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import AdminScannerMeetup from './pages/admin/AdminScannerMeetup';
import AdminMeetupList from './pages/admin/AdminMeetupList';
import AdminMeetup from './pages/admin/AdminMeetup';
import AdminMeetupEdit from './pages/admin/AdminMeetupEdit';
import AdminMeetupRegistrations from './pages/admin/AdminMeetupRegistrations';
import UserMeetupsList from './pages/user/UserMeetupsList';
import MentorshipLanding from './pages/user/MentorshipLanding';
import AdminMentorshipPrograms from './pages/admin/AdminMentorshipPrograms';
import AdminMentorshipManager from './pages/admin/AdminMentorshipManager';
import AdminMentorshipProgramEditor from './pages/admin/AdminMentorshipProgramEditor';
import AdminWeekEditor from './pages/admin/AdminWeekEditor';
import AdminWeekSubmissions from './pages/admin/AdminWeekSubmissions';
import AdminGeneralMentorshipRequests from './pages/admin/AdminGeneralMentorshipRequests';
import AdminAllProgramRegistrations from './pages/admin/AdminAllProgramRegistrations';
import AdminBlogList from './pages/admin/AdminBlogList';
import AdminBlogEditor from './pages/admin/AdminBlogEditor';
import AdminBlogEmailer from './pages/admin/AdminBlogEmailer';
import BlogListPage from './pages/BlogListPage';
import BlogDetail from './pages/user/BlogDetail';
import AdminHallOfFame from './pages/admin/AdminHallOfFame';
import AdminCommunityPhotos from './pages/admin/AdminCommunityPhotos';
import AdminFeedbackList from './pages/admin/AdminFeedbackList';
import PublicMeetupPage from './pages/PublicMeetupPage';


const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/admin" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
        <Route path="/" element={<PageTransition><UserDashboard /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
        <Route path="/user-list" element={<PageTransition><AllUserList /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordConfirm /></PageTransition>} />
        <Route path="/events" element={<PageTransition><UserEvents /></PageTransition>} />
        <Route path="/resource" element={<PageTransition><UserResource /></PageTransition>} />
        <Route path="/resume" element={<PageTransition><UserResumeBuilder /></PageTransition>} />
        <Route path="/resume-analyzer" element={<PageTransition><ResumeAnalyzer /></PageTransition>} />
        <Route path="/mentorship" element={<PageTransition><UserMentorshipForm /></PageTransition>} />
        <Route path="/mentorship-form" element={<PageTransition><AdminMentorshipSubmission /></PageTransition>} />
        <Route path="/profile/:username" element={<PageTransition><PublicProfile /></PageTransition>} />
        <Route path="/playground" element={<PageTransition><UserPlayGround /></PageTransition>} />
        <Route path="/mentorship-list" element={<PageTransition><UserMentorshipFormList /></PageTransition>} />
        <Route path="/code" element={<PageTransition><UserCodingPlatform /></PageTransition>} />

        <Route path="/admin/scanner/:id" element={<PageTransition><AdminScannerMeetup /></PageTransition>} />
        <Route path="/admin/meetups" element={<PageTransition><AdminMeetupList /></PageTransition>} />
        <Route path="/admin/meetup/create" element={<PageTransition><AdminMeetup /></PageTransition>} />
        <Route path="/admin/meetup/edit/:meetupId" element={<PageTransition><AdminMeetupEdit /></PageTransition>} />
        <Route path="/admin/meetup/registrations/:id" element={<PageTransition><AdminMeetupRegistrations /></PageTransition>} />
        <Route path="/meetups" element={<PageTransition><UserMeetupsList /></PageTransition>} />
        <Route path="/admin/mentorship-programs" element={<PageTransition><AdminMentorshipPrograms /></PageTransition>} />
        <Route path="/admin/mentorship/manage/:id" element={<PageTransition><AdminMentorshipManager /></PageTransition>} />
        <Route path="/admin/mentorship/create" element={<PageTransition><AdminMentorshipProgramEditor /></PageTransition>} />
        <Route path="/admin/mentorship/edit/:id" element={<PageTransition><AdminMentorshipProgramEditor /></PageTransition>} />
        <Route path="/admin/mentorship/program/:programId/week/create" element={<PageTransition><AdminWeekEditor /></PageTransition>} />
        <Route path="/admin/mentorship/week/:weekId/edit" element={<PageTransition><AdminWeekEditor /></PageTransition>} />
        <Route path="/admin/mentorship/submissions/:weekId" element={<PageTransition><AdminWeekSubmissions /></PageTransition>} />
        <Route path="/admin/mentorship/general-requests" element={<PageTransition><AdminGeneralMentorshipRequests /></PageTransition>} />
        <Route path="/admin/mentorship/all-registrations" element={<PageTransition><AdminAllProgramRegistrations /></PageTransition>} />

        {/* Blog Routes */}
        <Route path="/admin/blogs" element={<PageTransition><AdminBlogList /></PageTransition>} />
        <Route path="/admin/blog/create" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
        <Route path="/admin/blog/edit/:id" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
        <Route path="/admin/blog/email/:id" element={<PageTransition><AdminBlogEmailer /></PageTransition>} />
        <Route path="/blogs" element={<PageTransition><BlogListPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />

        {/* Hall of Fame */}
        <Route path="/admin/hall-of-fame" element={<PageTransition><AdminHallOfFame /></PageTransition>} />

        {/* Community Photos */}
        <Route path="/admin/community-photos" element={<PageTransition><AdminCommunityPhotos /></PageTransition>} />
        <Route path="/admin/feedback" element={<PageTransition><AdminFeedbackList /></PageTransition>} />

        {/* Auth route for OAuth callback handling */}
        <Route path="/auth" element={<PageTransition><AuthForm /></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
function Root() {
  const session = useSession();
  const { isLoading } = useSessionContext();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading CodeSapiens...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<CodeSapiensHero />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/admin/hall-of-fame" element={<AdminHallOfFame />} />
          <Route path="/admin/community-photos" element={<AdminCommunityPhotos />} />
          <Route path="/admin/feedback" element={<AdminFeedbackList />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/meetup/:id" element={<PublicMeetupPage />} />
          <Route path="/meetups" element={<UserMeetupsList />} />

          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/test-analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <NavBar />
        <AnimatedRoutes />
      </main>
    </div>
  );
}

import { LoadingProvider, useAppLoading } from "./context/LoadingContext";

// Root Component wrapped in LoadingProvider context consumer
const RootWithLoading = () => {
  return (
    <AnimatePresence mode="wait">
      <Root />
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LoadingProvider>
        <Router>
          <RootWithLoading />
          <Toaster position="top-center" />
        </Router>
      </LoadingProvider>
    </SessionContextProvider>
  );
}
