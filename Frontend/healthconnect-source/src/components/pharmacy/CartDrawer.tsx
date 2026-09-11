import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, setIsDrawerOpen, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/app/orders?checkout=true');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-colors">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-teal-600 dark:text-teal-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base transition-colors">Pharmacy Cart</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 transition-colors">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 transition-colors" />
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm transition-colors">Your pharmacy bag is empty</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">
                  Add prescribed medicines or wellness supplements to order.
                </p>
              </div>
            ) : (
              items.map(({ medicine, quantity }) => (
                <div
                  key={medicine.id}
                  className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex gap-3 items-center shadow-2xs transition-colors"
                >
                  <img
                    src={medicine.imageUrl}
                    alt={medicine.name}
                    className="w-14 h-14 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 transition-colors"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate transition-colors">{medicine.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 transition-colors">{medicine.strength}</p>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 transition-colors">
                      ${(medicine.discountPrice || medicine.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shrink-0 transition-colors">
                    <button
                      onClick={() => updateQuantity(medicine.id, quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center dark:text-slate-200 transition-colors">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(medicine.id, quantity + 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(medicine.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg shrink-0 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 transition-colors">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 transition-colors">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">
                    {deliveryFee === 0 ? 'FREE (Orders over $30)' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700 transition-colors">
                  <span>Estimated Total</span>
                  <span className="text-teal-700 dark:text-teal-400 transition-colors">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-teal-50/50 dark:bg-teal-900/20 p-2 rounded-lg border border-teal-100 dark:border-teal-900/50 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500 shrink-0 transition-colors" />
                <span>Licensed pharmacy partner fulfillment & prescription safety check</span>
              </div>

              <Button
                variant="primary"
                className="w-full py-2.5 font-bold shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
