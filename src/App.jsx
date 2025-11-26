import './index.css';
import React from 'react';
import {
  SessionContextProvider,
  useSession,
  useSessionContext,
  useUser,
} from '@supabase/auth-helpers-react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import Hero from './components/ui/Hero';
import Footer from './components/ui/Footer';
import AuthForm from './components/AuthForm';
import Dashboard from './admin/Dashboard';
import UserProfile from './user/UserProfile';
import UserDashboard from './user/UserDashboard';
import NavBar from './components/NavBar';
import AnalyticsPage from './admin/AnalyticsPage';
import NotFoundPage from './components/ui/NotFoundPage';
import CodeSapiensHero from './components/CodesapiensHero';
import AllUserList from './admin/AllUserList';
import ResetPassword from './components/ResetPassword';
import ResetPasswordConfirm from './components/ResetPasswordConfirm'
import UserEvents from './user/UserEvents';
import UserResource from './user/UserResource';
import UserResumeBuilder from './user/UserResumeBuilder';
import UserMentorshipForm from './user/UserMentorshipForm';
import AdminMentorshipSubmission from './admin/AdminMentorshipSubmission';
import PublicProfile from './components/PublicProfile';
import UserPlayGround from './user/UserPlayGround';
import UserMentorshipFormList from './user/UserMentorshipFormList';
import UserCodingPlatform from './user/UserCodingPlatform';
import AdminScannerMeetup from './admin/AdminScannerMeetup';
import AdminMeetupList from './admin/AdminMeetupList';
import AdminMeetup from './admin/AdminMeetup';
import AdminMeetupEdit from './admin/AdminMeetupEdit';
import UserMeetupsList from './user/UserMeetupsList';
import MentorshipLanding from './user/MentorshipLanding';
import AdminMentorshipPrograms from './admin/AdminMentorshipPrograms';



function Root() {
  const session = useSession();
  const { isLoading } = useSessionContext();
  console.log('Current session:');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Router>
          <Routes>
            <Route path="/" element={<CodeSapiensHero />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/profile/:username" element={<PublicProfile />} />

            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPasswordConfirm />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Router>
          <NavBar />
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<UserDashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/user-list" element={<AllUserList />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPasswordConfirm />} />
            <Route path="/events" element={<UserEvents />} />
            <Route path="/resource" element={<UserResource />} />
            <Route path="/resume" element={<UserResumeBuilder />} />
            <Route path="/mentorship" element={<UserMentorshipForm />} />
            <Route path="/mentorship-form" element={<AdminMentorshipSubmission />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/playground" element={<UserPlayGround />} />
            <Route path="/mentorship-list" element={<UserMentorshipFormList />} />
            <Route path="/code" element={<UserCodingPlatform />} />

            <Route path="/admin/scanner/:id" element={<AdminScannerMeetup />} />
            <Route path="/admin/meetups" element={<AdminMeetupList />} />
            <Route path="/admin/meetup/create" element={<AdminMeetup />} />
            <Route path="/admin/meetup/edit/:meetupId" element={<AdminMeetupEdit />} />
            <Route path="/meetups" element={<UserMeetupsList />} />
            <Route path="/mentorship-programs" element={<MentorshipLanding />} />
            <Route path="/admin/mentorship-programs" element={<AdminMentorshipPrograms />} />




            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Root />
    </SessionContextProvider>
  );
}
