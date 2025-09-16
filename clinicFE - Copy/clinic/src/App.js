import React, { useState, useEffect } from 'react';
import Homepage from './components/homepage';
import PatientRegister from './components/patient/patientRegister';
import StaffRegister from './components/staff/staffRegister';
import PatientDashboard from './components/patient/PatientDashboard';
import StaffDashboard from './components/staff/staffDashboard';
import LoginModal from './components/patient/LoginModal';
import StaffLoginModal from './components/staff/LoginModal';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Function to get current page from URL
  const getPageFromURL = () => {
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    
    // Check for hash-based routing first (for patient dashboard sections)
    if (path === '/dashboard' || hash) {
      return 'dashboard';
    }
    
    if (path === '/register') return 'register';
    if (path === '/staff-register') return 'staffRegister';
    if (path === '/staff-dashboard') return 'staffDashboard';
    if (path === '/admin-dashboard') return 'adminDashboard';
    return 'home';
  };

  // Check if user is authenticated
  const checkAuthentication = (page) => {
    if (page === 'dashboard') {
      const patientData = localStorage.getItem('patient');
      const rememberMe = localStorage.getItem('rememberMe');
      return patientData !== null;
    }
    if (page === 'staffDashboard') {
      const staffData = localStorage.getItem('staff');
      const rememberMeStaff = localStorage.getItem('rememberMeStaff');
      return staffData !== null;
    }
    if (page === 'adminDashboard') {
      const adminData = localStorage.getItem('admin');
      const rememberMeAdmin = localStorage.getItem('rememberMeAdmin');
      return adminData !== null;
    }
    return true; // Other pages don't require authentication
  };

  // Initialize page from URL on component mount
  useEffect(() => {
    const pageFromURL = getPageFromURL();
    
    // Check if the requested page requires authentication
    if (checkAuthentication(pageFromURL)) {
      setCurrentPage(pageFromURL);
    } else {
      // If not authenticated, redirect to home and update URL
      setCurrentPage('home');
      window.history.replaceState({ page: 'home' }, '', '/');
    }

    // Listen for browser back/forward button
    const handlePopState = () => {
      const newPage = getPageFromURL();
      if (checkAuthentication(newPage)) {
        setCurrentPage(newPage);
      } else {
        setCurrentPage('home');
        window.history.replaceState({ page: 'home' }, '', '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    
    // Update URL without causing page reload
    let url;
    switch (page) {
      case 'home':
        url = '/';
        break;
      case 'register':
        url = '/register';
        break;
      case 'staffRegister':
        url = '/staff-register';
        break;
      case 'dashboard':
        url = '/dashboard';
        break;
      case 'staffDashboard':
        url = '/staff-dashboard';
        break;
      case 'adminDashboard':
        url = '/admin-dashboard';
        break;
      default:
        url = '/';
    }
    window.history.pushState({ page }, '', url);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openStaffLoginModal = () => {
    setIsStaffLoginModalOpen(true);
  };

  const closeStaffLoginModal = () => {
    setIsStaffLoginModalOpen(false);
  };

  const openAdminLoginModal = () => {
    setIsAdminLoginModalOpen(true);
  };

  const closeAdminLoginModal = () => {
    setIsAdminLoginModalOpen(false);
  };

  const handleLogout = () => {
    closeLoginModal();
    closeStaffLoginModal();
    closeAdminLoginModal();
    // Navigate to home and update URL
    navigateTo('home');
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Homepage 
          onNavigate={navigateTo} 
          onOpenLogin={openLoginModal}
          onOpenStaffLogin={openStaffLoginModal}
          onOpenAdminLogin={openAdminLoginModal}
        />
      )}
      {currentPage === 'register' && <PatientRegister onNavigate={navigateTo} />}
      {currentPage === 'staffRegister' && <StaffRegister onNavigate={navigateTo} />}
      {currentPage === 'dashboard' && <PatientDashboard onNavigate={navigateTo} onLogout={handleLogout} />}
      {currentPage === 'staffDashboard' && <StaffDashboard onNavigate={navigateTo} onLogout={handleLogout} />}
      {currentPage === 'adminDashboard' && <AdminDashboard onNavigate={navigateTo} onLogout={handleLogout} />}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onNavigate={navigateTo}
        onOpenStaffLogin={openStaffLoginModal}
        onOpenAdminLogin={openAdminLoginModal}
      />
      
      <StaffLoginModal
        isOpen={isStaffLoginModalOpen}
        onClose={closeStaffLoginModal}
        onNavigate={navigateTo}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={closeAdminLoginModal}
        onNavigate={navigateTo}
      />
    </div>
  );
}

export default App;
