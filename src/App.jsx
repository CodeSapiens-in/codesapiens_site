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

import NavBar from './components/ui/NavBar';
import Hero from './components/ui/Hero';
import Footer from './components/ui/Footer';
import AuthForm from './components/AuthForm';
import Dashboard from './admin/Dashboard';
import UserProfile from './user/UserProfile';
import UserDashboard from './user/UserDashboard';
import UserNavbar from './user/UserNavbar';
import AnalyticsPage from './admin/AnalyticsPage';
import NotFoundPage from './components/ui/NotFoundPage';
import CodeSapiensHero from './components/CodesapiensHero';
import AllUserList from './admin/AllUserList';


function Root() {
  const session = useSession();
  const { isLoading } = useSessionContext();

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
        </Routes>
      </Router>
    </div>
  );
}


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Router>
          <UserNavbar />
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<UserDashboard />} />
            <Route path="/analytics" element={<AnalyticsPage/>} />
            <Route path="/user-list" element={<AllUserList/>} />
           
            <Route path="*" element={<NotFoundPage/>} />
         
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
