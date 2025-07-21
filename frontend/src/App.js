import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/common/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import GuardianDashboard from './pages/guardian/GuardianDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import ResearcherDashboard from './pages/researcher/ResearcherDashboard';
import AccessDenied from './pages/common/AccessDenied';
import PrivateRoute from './components/PrivateRoute';
import AdminBlockchainLogs from './pages/admin/AdminBlockchainLogs';
import ManageUsers from './pages/admin/ManageUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import LandingPage from './pages/common/LandingPage';
import { getToken } from './utils/auth';
import SearchMedicalRecords from './pages/admin/SearchMedicalRecords';
import SearchPatientInfo from './pages/admin/SearchPatientInfo';
import ViewMedicalRecords from './pages/admin/ViewMedicalRecords';
import ViewPatientInfo from './pages/admin/ViewPatientInfo';
import ManageMedicalRecords from './pages/admin/ManageMedicalRecords';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-dashboard" element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
      <Route path="/admin/manage-users" element={<PrivateRoute element={<ManageUsers />} allowedRoles={['admin']} />} />
      <Route path="/admin/manage-medical-records" element={<PrivateRoute element={<ManageMedicalRecords />} allowedRoles={['admin', 'doctor', 'nurse']} />} />

      {/* Role Dashboards */}
      <Route path="/doctor-dashboard" element={<PrivateRoute element={<DoctorDashboard />} allowedRoles={['doctor']} />} />
      <Route path="/nurse-dashboard" element={<PrivateRoute element={<NurseDashboard />} allowedRoles={['nurse']} />} />
      <Route path="/patient-dashboard" element={<PrivateRoute element={<PatientDashboard />} allowedRoles={['patient']} />} />
      <Route path="/guardian-dashboard" element={<PrivateRoute element={<GuardianDashboard />} allowedRoles={['guardian']} />} />
      <Route path="/staff-dashboard" element={<PrivateRoute element={<StaffDashboard />} allowedRoles={['staff']} />} />
      <Route path="/researcher-dashboard" element={<PrivateRoute element={<ResearcherDashboard />} allowedRoles={['researcher']} />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Blockchain and AI */}
      <Route path="/admin/blockchain-logs" element={<PrivateRoute element={<AdminBlockchainLogs />} allowedRoles={['admin']} />} />
      <Route path="/admin/analytics" element={<PrivateRoute element={<AdminAnalytics />} allowedRoles={['admin']} />} />

      {/* <Route path="/admin/search-medical-records" element={<PrivateRoute element={<SearchMedicalRecords />} allowedRoles={['admin','doctor']} />} /> */}
      <Route path="/admin/search-patient-info" element={<PrivateRoute element={<SearchPatientInfo />} allowedRoles={['admin']} />} />
      {/* <Route path="/admin/view-medical-records" element={<PrivateRoute element={<ViewMedicalRecords />} allowedRoles={['admin','doctor']} />} /> */}
      <Route path="/admin/view-patient-info" element={<PrivateRoute element={<ViewPatientInfo />} allowedRoles={['admin']} />} />
      
    </Routes>
  );
}

export default App;