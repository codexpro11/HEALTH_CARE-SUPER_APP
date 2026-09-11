import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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

// Provider Features
import { ProviderNfcScannerPage } from '../pages/provider/nfc/ProviderNfcScannerPage';
import { ProviderNfcSummaryPage } from '../pages/provider/nfc/ProviderNfcSummaryPage';
import { ProviderNfcEmergencyPage } from '../pages/provider/nfc/ProviderNfcEmergencyPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Provider Route Guard
const ProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Check if role is allowed to access provider dashboard
  if (role !== 'DOCTOR' && role !== 'HOSPITAL' && role !== 'ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
};

// Public Route Guard (Redirect to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    if (role === 'DOCTOR' || role === 'HOSPITAL') {
      return <Navigate to="/provider/dashboard" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

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
        <Route path="consent" element={<ConsentManagementPage />} />
        <Route path="insurance" element={<InsuranceDashboardPage />} />
        <Route path="insurance/claims" element={<InsuranceClaimsPage />} />
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
        <Route path="dashboard" element={<div className="p-8">Provider Dashboard - Coming Soon</div>} />
        <Route path="patients" element={<div className="p-8">Patients List - Coming Soon</div>} />
        <Route path="nfc-scanner" element={<ProviderNfcScannerPage />} />
        <Route path="nfc/summary/:id" element={<ProviderNfcSummaryPage />} />
        <Route path="nfc/emergency" element={<ProviderNfcEmergencyPage />} />
        <Route path="appointments" element={<div className="p-8">Provider Appointments - Coming Soon</div>} />
        <Route path="medical-records" element={<div className="p-8">Provider Records - Coming Soon</div>} />
        <Route path="prescriptions" element={<div className="p-8">Provider Prescriptions - Coming Soon</div>} />
        <Route path="insurance" element={<div className="p-8">Provider Insurance - Coming Soon</div>} />
        <Route path="profile" element={<div className="p-8">Provider Profile - Coming Soon</div>} />
        <Route path="settings" element={<div className="p-8">Provider Settings - Coming Soon</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};

