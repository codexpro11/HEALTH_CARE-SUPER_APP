import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  UserCheck,
  FileText,
  ShoppingBag,
  Clock,
  Heart,
  Activity,
  Droplet,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi } from '../../api/appointmentApi';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { pharmacyApi } from '../../api/pharmacyApi';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch upcoming appointment
  const { data: appointmentsRes, isLoading: isLoadingApts } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentApi.getAppointments('CONFIRMED'),
  });

  // Fetch recent records
  const { data: recordsRes } = useQuery({
    queryKey: ['medical-records', 'recent'],
    queryFn: () => medicalRecordApi.getRecords('ALL'),
  });

  // Fetch recent orders
  const { data: ordersRes } = useQuery({
    queryKey: ['pharmacy', 'orders'],
    queryFn: () => pharmacyApi.getOrders(),
  });

  const nextAppointment = appointmentsRes?.data?.[0];
  const recentRecords = recordsRes?.data?.slice(0, 3) || [];
  const recentOrder = ordersRes?.data?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Sarah'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">
          {nextAppointment
            ? 'You have 1 appointment scheduled for today.'
            : 'You have no urgent consultations pending.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 content-start">
        {/* Left 2 Columns: Quick Actions + Upcoming Appointment + EHR Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4 Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/app/appointments')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:dark:bg-blue-500 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Book Visit</span>
            </button>

            <button
              onClick={() => navigate('/app/doctors')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:dark:bg-green-500 group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Find Doctor</span>
            </button>

            <button
              onClick={() => navigate('/app/medical-records')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:dark:bg-orange-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Records</span>
            </button>

            <button
              onClick={() => navigate('/app/pharmacy')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:dark:bg-purple-500 group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pharmacy</span>
            </button>
          </div>

          {/* Upcoming Appointment Card matching theme */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Upcoming Appointment</h3>
              <button
                onClick={() => navigate('/app/appointments')}
                className="text-teal-600 dark:text-teal-400 text-sm font-semibold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {isLoadingApts ? (
              <div className="p-6">
                <LoadingSkeleton type="list" count={1} />
              </div>
            ) : nextAppointment ? (
              <div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img
                      src={nextAppointment.doctorPhotoUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'}
                      alt={nextAppointment.doctorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{nextAppointment.doctorName}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {nextAppointment.doctorSpecialization} • {nextAppointment.hospitalName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full uppercase shrink-0">
                        {nextAppointment.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">Date</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {nextAppointment.appointmentDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">Time</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {nextAppointment.appointmentTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 transition-colors">
                  {nextAppointment.meetingLink ? (
                    <a
                      href={nextAppointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-teal-700 text-center transition-colors"
                    >
                      Join Teleconsult
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate(`/app/appointments/${nextAppointment.id}`)}
                      className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      Join Teleconsult
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/app/appointments')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No consultations currently scheduled.{' '}
                <Link to="/app/doctors" className="text-teal-600 dark:text-teal-400 font-bold underline">
                  Find a Doctor to book
                </Link>
              </div>
            )}
          </div>

          {/* Recent Medical Records */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Recent Medical Records</h3>
              <Link
                to="/app/medical-records"
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate('/app/medical-records')}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{rec.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {rec.provider} • {rec.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/50 px-2 py-0.5 rounded-full shrink-0">
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Health Stats & Health Tip of the Day */}
        <div className="col-span-1 space-y-6">
          {/* Health Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Health Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-red-900 dark:text-red-300">Heart Rate</span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  72 <span className="text-xs font-normal">bpm</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Blood Pressure</span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">120/80</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">Glucose Level</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  94 <span className="text-xs font-normal">mg/dl</span>
                </span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Recent Activity
                </h4>
                <Link to="/app/medical-records" className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline">
                  History
                </Link>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Blood Test Report Ready</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Diagnostic Center • 2h ago</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Medicine Ordered: {recentOrder ? recentOrder.items[0]?.medicine.name : 'Amoxicillin'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">HealthPlus Pharmacy • Yesterday</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Health Tip of the Day matching theme */}
          <div className="bg-teal-600 dark:bg-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-100 dark:shadow-teal-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Health Tip of the Day</h3>
              <p className="text-sm text-teal-50 opacity-90 leading-relaxed">
                Staying hydrated is essential for kidney health. Aim for 8 glasses of water today!
              </p>
            </div>
            <Heart className="absolute -right-4 -bottom-4 w-24 h-24 text-teal-500 dark:text-teal-600 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};;
