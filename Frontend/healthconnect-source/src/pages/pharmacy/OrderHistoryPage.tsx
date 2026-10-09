import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { validateCheckout } from '../../lib/frontend';
import { errorMessage } from '../../lib/request';
import { pharmacyApi } from '../../api/pharmacyApi';
import { PharmacyOrder } from '../../types';
import { OrderCard } from '../../components/pharmacy/OrderCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const OrderHistoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Checkout Form State
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Metro City, 90210');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'INSURANCE' | 'COD'>('INSURANCE');

  const { items, getSubtotal, clearCart } = useCartStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get('checkout') === 'true' && items.length > 0) {
      setIsCheckoutOpen(true);
    }
  }, [searchParams, items]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['pharmacy-orders'],
    queryFn: () => pharmacyApi.getOrders(),
  });

  const orders = response?.data || [];

  const createOrderMutation = useMutation({
    mutationFn: (newOrder: { items: any[]; deliveryAddress: string; paymentMethod: string }) =>
      pharmacyApi.createOrder(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'orders'] });
      clearCart();
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setIsCheckoutOpen(false);
        setSearchParams({});
      }, 1800);
    },
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (createOrderMutation.isPending) return;
    const invalid = validateCheckout(items, deliveryAddress);
    setCheckoutError(invalid);
    if (invalid) return;
    createOrderMutation.mutate({
      items,
      deliveryAddress,
      paymentMethod,
    });
  };

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 4.99;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
          Pharmacy Orders & Deliveries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Real-time tracking of medications, order histories, and verified courier deliveries.
        </p>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : isError ? (
        <ErrorState message="Could not retrieve order history." onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any medication or wellness orders yet."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTrackOrder={(o) => setSelectedOrder(o)}
            />
          ))}
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Track Order #${selectedOrder.orderNumber}`}
          subtitle={`Estimated Delivery: ${selectedOrder.estimatedDeliveryTime}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs transition-colors">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Delivery Address:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Fulfillment Partner:</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">MetroCare Express Hub</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 transition-colors">
                Tracking History
              </h4>
              <div className="space-y-4 relative pl-6 border-l-2 border-teal-200 dark:border-teal-900/50 transition-colors">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-600 dark:bg-teal-500 ring-4 ring-white dark:ring-slate-900 transition-colors" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 transition-colors">{event.status}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors">{event.description}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end transition-colors">
              <Button variant="primary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Tracker
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSearchParams({});
          }}
          title="Confirm Pharmacy Order"
          subtitle="Verify delivery destination and billing method"
          maxWidth="md"
        >
          {checkoutSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto animate-bounce transition-colors" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">Order Submitted!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto transition-colors">
                Your pharmacy order has been submitted. Pharmacy staff is preparing your shipment for express courier pickup.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {(checkoutError || createOrderMutation.isError) && <p role="alert" className="text-sm text-rose-700">{checkoutError || errorMessage(createOrderMutation.error)}</p>}
              {/* Order Items summary */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs max-h-40 overflow-y-auto transition-colors">
                {items.map((i) => (
                  <div key={i.medicine.id} className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">
                      {i.quantity}x {i.medicine.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ${((i.medicine.discountPrice || i.medicine.price) * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Input
                label="Delivery Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 transition-colors">
                  Payment / Insurance Coverage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('INSURANCE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'INSURANCE'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600 dark:ring-teal-500 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Insurance
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600 dark:ring-teal-500 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600 dark:ring-teal-500 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-400 transition-colors">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="text-slate-900 dark:text-slate-100">{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700 transition-colors">
                  <span>Total Amount:</span>
                  <span className="text-teal-700 dark:text-teal-400">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setSearchParams({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!items.length}
                  isLoading={createOrderMutation.isPending}
                >
                  Confirm & Place Order
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
