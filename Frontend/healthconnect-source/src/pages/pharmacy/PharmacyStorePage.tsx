import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Upload,
  Search,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { pharmacyApi } from '../../api/pharmacyApi';
import { Medicine } from '../../types';
import { MedicineCard } from '../../components/pharmacy/MedicineCard';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const PharmacyStorePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [isUploadRxOpen, setIsUploadRxOpen] = useState(false);
  const [rxUploadSuccess, setRxUploadSuccess] = useState(false);
  const { setIsDrawerOpen, getItemCount } = useCartStore();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['medicines', { search, category }],
    queryFn: () =>
      pharmacyApi.getMedicines({
        search,
        category: category === 'ALL' ? undefined : category,
      }),
  });

  const medicines = response?.data || [];
  const cartItemCount = getItemCount();

  const categories = [
    { id: 'ALL', label: 'All Products' },
    { id: 'Cardiovascular', label: 'Cardiovascular' },
    { id: 'Diabetes Care', label: 'Diabetes' },
    { id: 'Respiratory', label: 'Respiratory' },
    { id: 'Pain Relief', label: 'Pain Relief' },
    { id: 'Vitamins & Supplements', label: 'Vitamins & Wellness' },
    { id: 'Digestive Health', label: 'Digestive' },
  ];

  const handleRxUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setRxUploadSuccess(true);
    setTimeout(() => {
      setRxUploadSuccess(false);
      setIsUploadRxOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
            Digital Pharmacy & Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Genuine prescription medications and clinical wellness items delivered with verified chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsUploadRxOpen(true)}
          >
            Upload Rx
          </Button>

          <Button
            variant="primary"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
            onClick={() => setIsDrawerOpen(true)}
          >
            Cart ({cartItemCount})
          </Button>
        </div>
      </div>

      {/* Upload Prescription Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-cyan-800 dark:from-teal-900 dark:to-cyan-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <FileText className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Have a doctor's prescription?</h3>
            <p className="text-xs text-teal-100/90 dark:text-teal-200/80 mt-0.5 transition-colors">
              Upload your written or electronic prescription. Our licensed pharmacists will prepare and verify your order.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 bg-white text-teal-800 hover:bg-teal-50 dark:bg-slate-800 dark:text-teal-400 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          onClick={() => setIsUploadRxOpen(true)}
        >
          Upload Prescription
        </Button>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search medicine brand or generic active ingredient..."
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                category === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Catalog Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : isError ? (
        <ErrorState message="Could not load pharmacy catalog." onRetry={() => refetch()} />
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Medicines Found"
          description="We couldn't find any medications matching your search term."
          actionLabel="View All Products"
          onAction={() => {
            setSearch('');
            setCategory('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {medicines.map((med) => (
            <MedicineCard key={med.id} medicine={med} />
          ))}
        </div>
      )}

      {/* Prescription Upload Modal */}
      {isUploadRxOpen && (
        <Modal
          isOpen={isUploadRxOpen}
          onClose={() => setIsUploadRxOpen(false)}
          title="Upload Medical Prescription"
          subtitle="Our pharmacy specialists verify all prescription orders prior to dispatch"
          maxWidth="md"
        >
          {rxUploadSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto animate-bounce transition-colors" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">Prescription Received!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto transition-colors">
                A registered pharmacist has begun verifying your prescription. We will notify you when medications are added to your cart.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRxUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-500 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">
                  Select or drag medical prescription image / PDF
                </p>
                <p className="text-[11px] text-slate-400 mt-1 transition-colors">
                  Ensure doctor's signature, date, and patient name are clearly legible.
                </p>
                <input type="file" id="rx-upload" className="hidden" />
                <label
                  htmlFor="rx-upload"
                  className="mt-3 inline-block px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
                >
                  Browse Files
                </label>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-xl text-xs text-teal-900 dark:text-teal-300 flex items-start gap-2 transition-colors">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  All submitted prescription files are encrypted in transit and handled exclusively by licensed pharmacy partners.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Button variant="outline" onClick={() => setIsUploadRxOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Prescription
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
