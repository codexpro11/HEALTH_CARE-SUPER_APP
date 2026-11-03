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
import { errorMessage } from '../../lib/request';
import { isDemoMode } from '../../lib/demo';
import { canCancelOrder, prescriptionRecords, quoteCart, validatePharmacyRequest } from '../../lib/healthcareRules';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
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
  const { user } = useAuth();
  const [prescriptionId, setPrescriptionId] = useState('');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [cancelling, setCancelling] = useState<PharmacyOrder | null>(null);

  // Checkout Form State
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'INSURANCE' | 'COD'>('INSURANCE');

  const { items, clearCart } = useCartStore();
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({ queryKey: ['pharmacy-prescriptions', user?.id], queryFn: () => medicalRecordApi.getRecords('PRESCRIPTION'), enabled: isCheckoutOpen });
  const documents = prescriptionRecords(recordsQuery.data?.data ?? [], isDemoMode ? user?.id : undefined);
  const needsPrescription = items.some(item => item.medicine.requiresPrescription);
  const cancelOrder = useMutation({ mutationFn: (id: string) => pharmacyApi.cancelOrder(id), onSuccess: result => {
    queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
    if (selectedOrder?.id === result.data.id) setSelectedOrder(result.data);
    setCancelling(null);
  } });

  useEffect(() => {
    if (searchParams.get('checkout') === 'true' && items.length > 0) {
      setIsCheckoutOpen(true);
    }
  }, [searchParams, items]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['pharmacy-orders', user?.id],
    queryFn: () => pharmacyApi.getOrders(),
  });

  const orders = (response?.data || []).filter(order => orderStatus === 'ALL' || order.status === orderStatus);

  const createOrderMutation = useMutation({
    mutationFn: (newOrder: Parameters<typeof pharmacyApi.createOrder>[0]) =>
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
    const invalid = validatePharmacyRequest(items, deliveryAddress, prescriptionId, documents);
    setCheckoutError(invalid);
    if (invalid) return;
    createOrderMutation.mutate({
      items,
      deliveryAddress,
      paymentMethod,
      prescriptionRecordId: needsPrescription ? prescriptionId : undefined,
    });
  };

  const { subtotal, deliveryFee, total: grandTotal } = quoteCart(items);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
          Pharmacy Orders & Deliveries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Review order history, delivery details and prescription review status.
        </p>
      </div>
      <p className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{isDemoMode ? 'Demo orders only. No payment, insurance approval, pharmacist review or delivery is performed.' : 'Prescription medicines require pharmacy approval before fulfillment.'}</p>
      <label className="block text-sm max-w-sm">Order status<select className="block w-full rounded-xl border p-2.5 mt-1 bg-white dark:bg-slate-900" value={orderStatus} onChange={event => setOrderStatus(event.target.value)}>
        {['ALL', 'CONFIRMED', 'PHARMACY_PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => <option key={status}>{status}</option>)}
      </select></label>

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
            <div key={order.id} className="space-y-2"><OrderCard
              key={order.id}
              order={order}
              onTrackOrder={(o) => setSelectedOrder(o)}
            />
              {order.prescriptionRecordId && <p className="text-xs text-slate-500 px-3">Prescription reference supplied for review; selection does not establish clinical validity.</p>}
              {canCancelOrder(order.status) && <Button variant="outline" size="sm" onClick={() => { cancelOrder.reset(); setCancelling(order); }}>Cancel order</Button>}
            </div>
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
                <span className="font-bold text-teal-700 dark:text-teal-400">{isDemoMode ? 'Sample fulfillment; no courier assigned' : 'Check with your pharmacy'}</span>
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
                      {Number.isFinite(Date.parse(event.timestamp)) ? new Date(event.timestamp).toLocaleString() : event.timestamp}
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
            if (createOrderMutation.isPending) return;
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
                {isDemoMode ? 'Your demo order was saved. No payment was processed or shipment arranged.' : 'Your order request was submitted. Follow its status for pharmacy confirmation.'}
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
                      ${((i.medicine.discountPrice ?? i.medicine.price) * i.quantity).toFixed(2)}
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
                disabled={createOrderMutation.isPending}
              />
              {needsPrescription && <div className="space-y-2">
                <label className="block text-sm">Prescription document<select className="block w-full rounded-xl border p-2.5 mt-1 bg-white dark:bg-slate-900" value={prescriptionId} onChange={event => setPrescriptionId(event.target.value)} disabled={createOrderMutation.isPending} required>
                  <option value="">Select an uploaded prescription</option>{documents.map(record => <option key={record.id} value={record.id}>{record.title} · {record.date}</option>)}
                </select></label>
                {recordsQuery.isLoading && <p className="text-xs">Loading your documents.</p>}
                {recordsQuery.isError && <ErrorState message={errorMessage(recordsQuery.error)} onRetry={() => recordsQuery.refetch()} />}
                <p className="text-xs text-slate-500">Submitting this reference requests sharing of this prescription with the dispensing pharmacy for review. A pharmacist must verify its validity and medicine match.</p>
                <Link to="/app/medical-records" onClick={() => { setIsCheckoutOpen(false); setSearchParams({}); }} className="text-sm underline text-teal-700">Upload a prescription in Medical Records</Link>
              </div>}

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
                  disabled={!items.length || (needsPrescription && (recordsQuery.isLoading || recordsQuery.isError || !prescriptionId))}
                  isLoading={createOrderMutation.isPending}
                >
                  Confirm & Place Order
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
      <Modal isOpen={!!cancelling} onClose={() => { if (!cancelOrder.isPending) setCancelling(null); }} title="Cancel pharmacy order?">
        <p className="text-sm mb-4">Cancel order {cancelling?.orderNumber}? Its history will be retained. {isDemoMode && 'No payment or refund is processed in this demo.'}</p>
        {cancelOrder.isError && <p role="alert" className="text-rose-700 mb-3">{errorMessage(cancelOrder.error)}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={cancelOrder.isPending} onClick={() => setCancelling(null)}>Keep order</Button><Button isLoading={cancelOrder.isPending} onClick={() => cancelling && !cancelOrder.isPending && cancelOrder.mutate(cancelling.id)}>Confirm cancellation</Button></div>
      </Modal>
    </div>
  );
};
