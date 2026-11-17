import React from 'react';
import { ShoppingBag, Plus, FileText, Check } from 'lucide-react';
import { Medicine } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useCartStore } from '../../stores/cartStore';

export interface MedicineCardProps {
  medicine: Medicine;
  onViewDetails?: (med: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onViewDetails,
}) => {
  const { addItem, items } = useCartStore();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartQuantity = items.find((i) => i.medicine.id === medicine.id)?.quantity || 0;

  const handleAdd = () => {
    addItem(medicine, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Card className="hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 transition-colors">
          <img
            src={medicine.imageUrl}
            alt={medicine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {medicine.requiresPrescription && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
              <FileText className="w-3 h-3" /> Rx Required
            </span>
          )}
          {medicine.discountPrice !== undefined && (
            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Save {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded uppercase tracking-wider transition-colors">
            {medicine.category}
          </span>
          <h4
            onClick={() => onViewDetails?.(medicine)}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer mt-1"
          >
            {medicine.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 transition-colors">{medicine.genericName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 transition-colors">{medicine.strength}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 transition-colors">
        <div>
            {medicine.discountPrice !== undefined ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
                ${medicine.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through transition-colors">
                ${medicine.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
              ${medicine.price.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant={cartQuantity > 0 ? 'secondary' : 'primary'}
          leftIcon={
            justAdded ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )
          }
          onClick={handleAdd}
        >
          {justAdded ? 'Added' : cartQuantity > 0 ? `In Cart (${cartQuantity})` : 'Add'}
        </Button>
      </div>
    </Card>
  );
};

