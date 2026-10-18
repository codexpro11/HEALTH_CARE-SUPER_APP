export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'PHARMACY'
  | 'DIAGNOSTIC_CENTER'
  | 'AMBULANCE_PROVIDER'
  | 'BLOOD_BANK'
  | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: UserRole;
  avatarUrl?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: UserRole;
  termsAccepted: boolean;
}

export type ConsultationType = 'IN_PERSON' | 'VIDEO' | 'AUDIO';

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  location: string;
  hospitalAffiliation: string;
  consultationFee: number;
  consultationTypes: ConsultationType[];
  about: string;
  bio?: string;
  availableDays: string[];
  nextAvailableSlot: string;
  availableSlots?: string[];
  languages: string[];
  timeSlots: {
    id: string;
    date: string;
    time: string;
    available: boolean;
  }[];
}

export interface DoctorFilter {
  specialization?: string;
  location?: string;
  consultationType?: ConsultationType;
  minRating?: number;
  maxFee?: number;
  experienceYears?: number;
  availableToday?: boolean;
  searchQuery?: string;
  search?: string;
}

export type AppointmentStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorPhotoUrl: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: ConsultationType;
  consultationFee: number;
  status: AppointmentStatus;
  reasonForVisit: string;
  meetingLink?: string;
  roomNumber?: string;
  notes?: string;
  consultation?: { notes: string; prescription: string; updatedAt: string };
  providerTimeline?: { status: AppointmentStatus; at: string }[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  slotDate: string;
  slotTime: string;
  consultationType: ConsultationType;
  reasonForVisit: string;
}

export type RecordType =
  | 'CONSULTATION_NOTE'
  | 'PRESCRIPTION'
  | 'DIAGNOSTIC_REPORT'
  | 'ALLERGY'
  | 'VACCINATION'
  | 'SURGICAL_HISTORY'
  | 'DOCUMENT'
  | 'LAB_REPORT'
  | 'RADIOLOGY'
  | 'DISCHARGE_SUMMARY'
  | 'CLINICAL_NOTE';

export type MedicalRecordType = RecordType;

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  recordType: RecordType;
  doctorName: string;
  provider: string;
  date: string;
  summary: string;
  status: 'VERIFIED' | 'PENDING' | 'ARCHIVED';
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
  fileMimeType?: string;
  originalFileName?: string;
  tags: string[];
  confidentialityLevel: 'STANDARD' | 'RESTRICTED' | 'CONFIDENTIAL';
}

export interface ProviderConsent {
  id: string;
  providerName: string;
  providerType: string;
  accessScope: string[];
  grantedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Twice daily after meals"
  duration: string;  // e.g., "7 days"
  instructions: string;
  remainingRefills?: number;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  doctorSpecialization: string;
  clinicOrHospital: string;
  dateIssued: string;
  validUntil: string;
  diagnosis: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  medications: PrescriptionMedication[];
  digitalSignatureId: string;
  notes?: string;
}

export type DiagnosticBookingStatus =
  | 'CANCELLED'
  | 'BOOKED'
  | 'SAMPLE_COLLECTION'
  | 'PROCESSING'
  | 'REPORT_READY'
  | 'DELIVERED';

export interface DiagnosticTest {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  price: number;
  discountedPrice?: number;
  turnaroundTime: string;
  preparationNotes: string;
  isHomeCollectionAvailable: boolean;
  homeCollectionAvailable?: boolean;
  fastingRequired?: boolean;
  fastingHours?: number;
  parametersCount?: number;
  parametersSample?: string[];
}

export interface DiagnosticCenter {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  contactNumber: string;
  availableTests: DiagnosticTest[];
  accreditation: string;
  openingHours: string;
}

export interface DiagnosticBooking {
  id: string;
  bookingRef: string;
  centerId: string;
  centerName: string;
  testName: string;
  testId: string;
  collectionType: 'HOME_COLLECTION' | 'CENTER_VISIT';
  scheduledDate: string;
  scheduledTime: string;
  status: DiagnosticBookingStatus;
  price: number;
  patientAddress?: string;
  reportUrl?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: 'ANTIBIOTIC' | 'ANALGESIC' | 'CARDIOLOGY' | 'DIABETES' | 'VITAMINS' | 'FIRST_AID' | 'RESPIRATORY';
  price: number;
  discountPrice?: number;
  dosageForm: string; // e.g., "Tablet", "Syrup", "Capsule"
  strength: string;   // e.g., "500mg"
  inStock: boolean;
  stockCount: number;
  requiresPrescription: boolean;
  description: string;
  sideEffects?: string[];
  imageUrl: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PHARMACY_PROCESSING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
  deliveryAddress: string;
  prescriptionUploaded?: boolean;
  prescriptionRecordId?: string;
  status: OrderStatus;
  paymentMethod: 'CARD' | 'UPI' | 'CASH_ON_DELIVERY' | 'INSURANCE' | 'COD';
  createdAt: string;
  estimatedDeliveryTime: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
}

export interface Hospital {
  id: string;
  name: string;
  distanceKm: number;
  address: string;
  phone: string;
  emergencyPhone: string;
  rating: number;
  specializations: string[];
  hasEmergency: boolean;
  hasICU: boolean;
  bedAvailability: {
    icuAvailable: number;
    icuTotal: number;
    generalAvailable: number;
    generalTotal: number;
    emergencyAvailable: number;
    emergencyTotal: number;
  };
  directionsUrl?: string;
}

export interface BloodBank {
  id: string;
  name: string;
  distanceKm: number;
  address: string;
  contactNumber: string;
  operatingHours: string;
  isOpen24x7: boolean;
  inventory: {
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    unitsAvailable: number;
    status: 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  }[];
}

export type EmergencyStatus = 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';

export interface EmergencyRequest {
  id: string;
  clientRequestId?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  emergencyType: string;
  latitude?: number;
  longitude?: number;
  locationSource?: 'GPS' | 'MANUAL';
  accuracyMeters?: number;
  locationCapturedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  address: string;
  status: EmergencyStatus;
  etaMinutes?: number;
  ambulance?: {
    vehicleNumber: string;
    paramedicName: string;
    paramedicContact: string;
    currentSpeedKmh: number;
    assignedHospital: string;
  };
  nearbyHospitals: {
    id: string;
    name: string;
    distanceKm: number;
    emergencyBeds: number;
    icuBeds: number;
    phone: string;
  }[];
  createdAt: string;
}

export type NotificationType =
  | 'AppointmentBooked'
  | 'AppointmentCancelled'
  | 'PrescriptionCreated'
  | 'LabReportReady'
  | 'MedicineOrderShipped'
  | 'EmergencyRequestCreated'
  | 'EmergencyRequestCancelled'
  | 'PaymentSuccessful';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
