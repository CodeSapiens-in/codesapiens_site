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
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
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
import AdminFormBuilder from './pages/admin/AdminFormBuilder';
import UserProgramsList from './pages/user/UserProgramsList';
import UserFormView from './pages/user/UserFormView';
import AdminProgramSubmissions from './pages/admin/AdminProgramSubmissions';
import AdminProgramsList from './pages/admin/AdminProgramsList';
import { LoadingProvider } from './context/LoadingContext';

// ─────────────────────────────────────────────
//  SPACE THEME TOKENS
//  bg-deep:  #03040A   void black
//  bg-card:  #080B14   deep space navy
//  border:   #1A2240   nebula rim
//  primary:  #4F8EF7   starlight blue
//  accent:   #9B6DFF   nebula violet
//  text:     #C8D6F0   moonlit silver
// ─────────────────────────────────────────────

// ── Space loading screen ─────────────────────
const SpaceLoader = () => {
  // Static star positions
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: (i * 137.508) % 100,
    y: (i * 97.3) % 100,
    r: i % 5 === 0 ? 1.6 : i % 3 === 0 ? 1 : 0.6,
    delay: (i * 0.23) % 4,
    dur: 2.5 + (i % 3),
  }));

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#03040A] relative overflow-hidden">

      {/* Nebula blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#4F8EF7] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#9B6DFF] opacity-[0.05] blur-[130px] pointer-events-none" />

      {/* Star field */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity="0">
            <animate
              attributeName="opacity"
              values={`0;${0.3 + s.r * 0.15};0`}
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Loader core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5 relative z-10"
      >
        {/* Spinner with orbit rings */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#080B14] border border-[#1A2240] flex items-center justify-center shadow-[0_0_32px_rgba(79,142,247,0.12)]">
            <Loader2 className="w-7 h-7 text-[#4F8EF7] animate-spin" />
          </div>
          {/* Orbit ring 1 */}
          <div
            className="absolute inset-[-10px] rounded-full border border-[#4F8EF7]/20 border-dashed animate-spin"
            style={{ animationDuration: '16s' }}
          />
          {/* Orbit ring 2 */}
          <div
            className="absolute inset-[-22px] rounded-full border border-[#9B6DFF]/12 border-dashed animate-spin"
            style={{ animationDuration: '26s', animationDirection: 'reverse' }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[#C8D6F0] font-bold text-sm tracking-tight">CodeSapiens</p>
          <p className="text-[10px] text-[#2A3D60] uppercase tracking-[0.2em] font-bold animate-pulse">
            Initializing...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ── Animated routes ──────────────────────────
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
        <Route path="/programs" element={<PageTransition><UserProgramsList /></PageTransition>} />
        <Route path="/programs/:id" element={<PageTransition><UserFormView /></PageTransition>} />
        <Route path="/admin/programs" element={<PageTransition><AdminProgramsList /></PageTransition>} />
        <Route path="/admin/programs/:id/submissions" element={<PageTransition><AdminProgramSubmissions /></PageTransition>} />
        <Route path="/admin/mentorship-programs" element={<PageTransition><AdminMentorshipPrograms /></PageTransition>} />
        <Route path="/admin/mentorship/manage/:id" element={<PageTransition><AdminMentorshipManager /></PageTransition>} />
        <Route path="/admin/mentorship/create" element={<PageTransition><AdminMentorshipProgramEditor /></PageTransition>} />
        <Route path="/admin/mentorship/edit/:id" element={<PageTransition><AdminMentorshipProgramEditor /></PageTransition>} />
        <Route path="/admin/mentorship/program/:programId/week/create" element={<PageTransition><AdminWeekEditor /></PageTransition>} />
        <Route path="/admin/mentorship/week/:weekId/edit" element={<PageTransition><AdminWeekEditor /></PageTransition>} />
        <Route path="/admin/mentorship/submissions/:weekId" element={<PageTransition><AdminWeekSubmissions /></PageTransition>} />
        <Route path="/admin/mentorship/general-requests" element={<PageTransition><AdminGeneralMentorshipRequests /></PageTransition>} />
        <Route path="/admin/mentorship/all-registrations" element={<PageTransition><AdminAllProgramRegistrations /></PageTransition>} />

        <Route path="/admin/blogs" element={<PageTransition><AdminBlogList /></PageTransition>} />
        <Route path="/admin/blog/create" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
        <Route path="/admin/blog/edit/:id" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
        <Route path="/admin/blog/email/:id" element={<PageTransition><AdminBlogEmailer /></PageTransition>} />
        <Route path="/blogs" element={<PageTransition><BlogListPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />

        <Route path="/admin/hall-of-fame" element={<PageTransition><AdminHallOfFame /></PageTransition>} />
        <Route path="/admin/community-photos" element={<PageTransition><AdminCommunityPhotos /></PageTransition>} />
        <Route path="/admin/feedback" element={<PageTransition><AdminFeedbackList /></PageTransition>} />
        <Route path="/admin/form-builder" element={<PageTransition><AdminFormBuilder /></PageTransition>} />
        <Route path="/admin/form-builder/:id" element={<PageTransition><AdminFormBuilder /></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// ── Root ─────────────────────────────────────
function Root() {
  const session = useSession();
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <SpaceLoader />;
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-[#03040A]">
        <Routes>
          <Route path="/" element={<CodeSapiensHero />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/admin/hall-of-fame" element={<AdminHallOfFame />} />
          <Route path="/admin/community-photos" element={<AdminCommunityPhotos />} />
          <Route path="/admin/feedback" element={<AdminFeedbackList />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/meetup/:id" element={<PublicMeetupPage />} />
          <Route path="/meetups" element={<UserMeetupsList />} />
          <Route path="/programs" element={<UserProgramsList />} />
          <Route path="/programs/:id" element={<UserFormView />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/test-analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#03040A]">
      <main className="flex-grow">
        <NavBar />
        <AnimatedRoutes />
      </main>
    </div>
  );
}

// ── App shell ─────────────────────────────────
const RootWithLoading = () => (
  <AnimatePresence mode="wait">
    <Root />
  </AnimatePresence>
);

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LoadingProvider>
        <Router>
          <RootWithLoading />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#080B14',
                color: '#C8D6F0',
                border: '1px solid #1A2240',
                fontWeight: 700,
                fontSize: '13px',
              },
            }}
          />
        </Router>
      </LoadingProvider>
    </SessionContextProvider>
  );
}
