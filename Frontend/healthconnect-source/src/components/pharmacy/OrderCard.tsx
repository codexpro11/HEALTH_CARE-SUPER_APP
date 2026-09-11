import React from 'react';
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { PharmacyOrder } from '../../types';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export interface OrderCardProps {
  order: PharmacyOrder;
  onTrackOrder?: (order: PharmacyOrder) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onTrackOrder }) => {
  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wider transition-colors">
              {order.orderNumber}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items preview */}
      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-colors">
        {order.items.map((item) => (
          <div key={item.medicine.id} className="flex justify-between items-center">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px] transition-colors">
              {item.quantity}x {item.medicine.name}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">
              ${((item.medicine.discountPrice || item.medicine.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline mini tracker */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 transition-colors">
            <Truck className="w-4 h-4 text-teal-600 dark:text-teal-500 shrink-0" />
            <span className="font-medium">
              Latest update: {order.timeline[order.timeline.length - 1].description}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider transition-colors">Total</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
            ${order.finalAmount.toFixed(2)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => onTrackOrder?.(order)}
        >
          Track Order
        </Button>
      </div>
    </Card>
  );
};
