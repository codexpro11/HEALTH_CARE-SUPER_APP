import React from 'react';
import { ProviderAccountPage } from '../pages/provider/ProviderAccountPage';
import { DemoNoticePage } from '../pages/auth/DemoNoticePage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { homeForRole, isProviderRole } from '../lib/nfcAuthorization';
import { ProviderWorkspacePage } from '../pages/provider/ProviderWorkspacePage';
import { PhaseProgressPage } from '../pages/PhaseProgressPage';
import { RecordComparisonPage } from '../pages/RecordComparisonPage';
import { ServicesComparisonPage } from '../pages/ServicesComparisonPage';
import { EmergencyComparisonPage } from '../pages/EmergencyComparisonPage';
import { RoleWorkspacePage } from '../pages/RoleWorkspacePage';

// Layouts
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProviderLayout } from '../layouts/ProviderLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// App Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { DoctorListPage } from '../pages/doctors/DoctorListPage';
import { DoctorDetailPage } from '../pages/doctors/DoctorDetailPage';
import { AppointmentListPage } from '../pages/appointments/AppointmentListPage';
import { AppointmentDetailPage } from '../pages/appointments/AppointmentDetailPage';
import { MedicalRecordListPage } from '../pages/medical-records/MedicalRecordListPage';
import { PrescriptionListPage } from '../pages/prescriptions/PrescriptionListPage';
import { DiagnosticListPage } from '../pages/diagnostics/DiagnosticListPage';
import { PharmacyStorePage } from '../pages/pharmacy/PharmacyStorePage';
import { OrderHistoryPage } from '../pages/pharmacy/OrderHistoryPage';
import { HospitalListPage } from '../pages/hospitals/HospitalListPage';
import { BloodBankListPage } from '../pages/blood-banks/BloodBankListPage';
import { EmergencyPage } from '../pages/emergency/EmergencyPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SettingsPage } from '../pages/settings/SettingsPage';

// New Features
import { NfcCardPage } from '../pages/nfc/NfcCardPage';
import { ConsentManagementPage } from '../pages/consent/ConsentManagementPage';
import { InsuranceDashboardPage } from '../pages/insurance/InsuranceDashboardPage';
import { InsuranceDetailsPage } from '../pages/insurance/InsuranceDetailsPage';
import { InsuranceClaimsPage } from '../pages/insurance/InsuranceClaimsPage';
import { InsuranceClaimDetailsPage } from '../pages/insurance/InsuranceClaimDetailsPage';

// Provider Features
import { ProviderNfcScannerPage } from '../pages/provider/nfc/ProviderNfcScannerPage';
import { ProviderNfcSummaryPage } from '../pages/provider/nfc/ProviderNfcSummaryPage';
import { ProviderNfcEmergencyPage } from '../pages/provider/nfc/ProviderNfcEmergencyPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'PATIENT') return <Navigate to={homeForRole(role)} replace />;
  return <>{children}</>;
};

// Provider Route Guard
const ProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Check if role is allowed to access provider dashboard
  if (!isProviderRole(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }
  return <>{children}</>;
};

// Public Route Guard (Redirect to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) return <Navigate to={homeForRole(role)} replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/demo-notice" element={<DemoNoticePage />} />
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? homeForRole(role) : '/login'} replace />} />
      <Route path="/workspace" element={!isAuthenticated ? <Navigate to="/login" replace /> : role === 'PATIENT' || isProviderRole(role) ? <Navigate to={homeForRole(role)} replace /> : <RoleWorkspacePage />} />

      {/* Auth Routes */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Healthcare App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="doctors" element={<DoctorListPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="appointments" element={<AppointmentListPage />} />
        <Route path="appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="nfc" element={<NfcCardPage />} />
        <Route path="progress" element={<PhaseProgressPage />} />
        <Route path="compare" element={<EmergencyComparisonPage />} />
        <Route path="compare/services" element={<ServicesComparisonPage />} />
        <Route path="compare/records" element={<RecordComparisonPage />} />
        <Route path="consent" element={<ConsentManagementPage />} />
        <Route path="insurance" element={<InsuranceDashboardPage />} />
        <Route path="insurance/claims" element={<InsuranceClaimsPage />} />
        <Route path="insurance/claims/:id" element={<InsuranceClaimDetailsPage />} />
        <Route path="insurance/:id" element={<InsuranceDetailsPage />} />
        <Route path="medical-records" element={<MedicalRecordListPage />} />
        <Route path="prescriptions" element={<PrescriptionListPage />} />
        <Route path="diagnostics" element={<DiagnosticListPage />} />
        <Route path="pharmacy" element={<PharmacyStorePage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="hospitals" element={<HospitalListPage />} />
        <Route path="blood-banks" element={<BloodBankListPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <ProviderRoute>
            <ProviderLayout />
          </ProviderRoute>
        }
      >
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderWorkspacePage />} />
        <Route path="patients" element={<ProviderWorkspacePage view="patients" />} />
        <Route path="progress" element={<PhaseProgressPage />} />
        <Route path="appointments/:id" element={<ProviderWorkspacePage view="appointments" />} />
        <Route path="nfc-scanner" element={<ProviderNfcScannerPage />} />
        <Route path="nfc/summary/:id" element={<ProviderNfcSummaryPage />} />
        <Route path="nfc/emergency" element={<ProviderNfcEmergencyPage />} />
        <Route path="appointments" element={<ProviderWorkspacePage view="appointments" />} />
        <Route path="medical-records" element={<ProviderWorkspacePage view="records" />} />
        <Route path="prescriptions" element={<ProviderWorkspacePage view="prescriptions" />} />
        <Route path="insurance" element={<ProviderAccountPage view="insurance" />} />
        <Route path="profile" element={<ProviderAccountPage view="profile" />} />
        <Route path="settings" element={<ProviderAccountPage view="settings" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
