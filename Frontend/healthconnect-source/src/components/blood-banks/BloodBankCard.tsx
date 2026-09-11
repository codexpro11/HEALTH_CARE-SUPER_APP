import React from 'react';
import { Droplet, MapPin, Phone, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BloodBank } from '../../types';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Badge } from '../common/Badge';

export interface BloodBankCardProps {
  bloodBank: BloodBank;
  selectedGroup?: string;
  onCall?: (phone: string) => void;
}

export const BloodBankCard: React.FC<BloodBankCardProps> = ({
  bloodBank,
  selectedGroup,
  onCall,
}) => {
  return (
    <Card className="hover:border-slate-300 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              <MapPin className="w-3 h-3 text-teal-600" />
              {bloodBank.distanceKm} km away
            </span>
            {bloodBank.isOpen24x7 && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" /> 24x7 Open
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">{bloodBank.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{bloodBank.address}</p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <Droplet className="w-5 h-5 fill-rose-500" />
        </div>
      </div>

      {/* Blood Inventory Chips */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Available Blood Units
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
          {bloodBank.inventory.map((item) => {
            const isHighlighted = selectedGroup && selectedGroup === item.bloodGroup;
            const statusColor = {
              ADEQUATE: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
              LOW: 'border-amber-200 bg-amber-50/70 text-amber-800',
              CRITICAL: 'border-rose-200 bg-rose-50/70 text-rose-800',
              UNAVAILABLE: 'border-slate-200 bg-slate-100 text-slate-400',
            }[item.status];

            return (
              <div
                key={item.bloodGroup}
                className={`p-1.5 rounded-xl border transition-all ${statusColor} ${
                  isHighlighted ? 'ring-2 ring-rose-500 font-extrabold scale-105 shadow-xs' : ''
                }`}
              >
                <span className="text-xs font-bold block">{item.bloodGroup}</span>
                <span className="text-[11px] font-semibold">{item.unitsAvailable}u</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Contact */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-500">{bloodBank.operatingHours}</span>
        <a
          href={`tel:${bloodBank.contactNumber}`}
          onClick={(e) => {
            if (onCall) {
              e.preventDefault();
              onCall(bloodBank.contactNumber);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-600" />
          <span>{bloodBank.contactNumber}</span>
        </a>
      </div>
    </Card>
  );
};
