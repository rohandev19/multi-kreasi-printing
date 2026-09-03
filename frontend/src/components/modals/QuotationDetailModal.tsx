import { Download, Printer, Send, ShoppingBag, Pencil, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string | null;
}

export default function QuotationDetailModal({ isOpen, onClose, quotationId }: Props) {
  const { success, error } = useToast();
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && quotationId) {
      fetchQuotation();
    } else {
      setQuotation(null);
    }
  }, [isOpen, quotationId]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/quotations/${quotationId}`);
      setQuotation(res.data);
    } catch (err: any) {
      error('Failed to load', err.response?.data?.message || 'Could not load quotation details.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleConvert = async () => {
    try {
      await api.post(`/api/v1/quotations/${quotationId}/convert`);
      setIsConvertModalOpen(false);
      success('Order Created', `Order created from Quotation ${quotationId}`);
      onClose();
    } catch (err: any) {
      error('Convert Failed', err.response?.data?.message || 'Please try again.');
    }
  };

  const handleSend = () => {
    setIsSendModalOpen(false);
    success('Quotation Sent', `Quotation ${quotationId} has been sent.`);
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quotation Details`} size="2xl">
      {loading || !quotation ? (
        <div className="p-12 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
      <>
        <div className="flex flex-col h-[calc(100vh-200px)]">
        
        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white">
          <div className="p-8 sm:p-10 max-w-4xl mx-auto print:p-0">
            
            {/* QUOTATION HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 mb-8 gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-sm print:shadow-none">
                  MK
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">PT Multi Kreasi Printing</h1>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">Jl. Percetakan Negara No. 123<br />Jakarta Pusat, DKI Jakarta 10560<br />+62 21 1234 5678</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100 sm:bg-transparent sm:p-0 sm:border-0 print:bg-transparent print:border-0">
                <h2 className="text-2xl font-black tracking-widest text-slate-300 uppercase mb-2">Quotation</h2>
                <div className="text-lg font-mono font-bold text-indigo-600 mb-2">{quotation.id}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:block">
                  <div className="text-slate-500 mb-1"><span className="font-bold text-slate-700">Date:</span> {quotation.date}</div>
                  <div className="text-slate-500"><span className="font-bold text-slate-700">Valid Until:</span> {quotation.validUntil}</div>
                </div>
                <div className="mt-4 sm:flex justify-end hidden print:hidden">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    quotation.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                    quotation.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                    quotation.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    quotation.status === 'Viewed' ? 'bg-indigo-100 text-indigo-700' :
                    quotation.status === 'Declined' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {quotation.status === 'Accepted' && <CheckCircle size={14} />}
                    {quotation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quotation For</h3>
              <div className="text-sm">
                <p className="font-bold text-slate-900 text-base">{quotation.customer?.companyName || quotation.customer?.name}</p>
                <p className="text-slate-700 font-medium mt-1">Attn: {quotation.customer?.name}</p>
                <p className="text-slate-600 mt-1">{quotation.customer?.address || 'No address provided'}</p>
                <p className="text-slate-600 mt-1">{quotation.customer?.email} • {quotation.customer?.phone}</p>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden print:border-none print:rounded-none">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 print:bg-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description & Specs</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Disc</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {quotation.items?.map((item: any, idx: number) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 print:bg-white'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-slate-900">{item.product?.name || 'Custom Product'}</div>
                        <div className="text-xs text-slate-500">{item.product?.description || 'Standard specs'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right font-mono">-</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-bold text-right font-mono">{formatCurrency(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS & TERMS */}
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {quotation.terms}
                </div>
              </div>
              
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Subtotal</span>
                      <span className="font-mono text-slate-900 font-bold">{formatCurrency(quotation.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Tax (11%)</span>
                      <span className="font-mono text-slate-900">{formatCurrency(quotation.totalAmount * 0.11)}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-base">Grand Total</span>
                      <span className="text-2xl font-extrabold text-indigo-600 tracking-tight font-mono">{formatCurrency(quotation.totalAmount * 1.11)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUOTATION TIMELINE (Hidden in Print) */}
            <div className="print:hidden border-t border-slate-200 pt-8 mt-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Clock size={16} className="text-slate-400" />
                Quotation Timeline
              </h3>
              <div className="relative border-l-2 border-slate-200 ml-2 space-y-4 py-2">
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-700">Created</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{new Date(quotation.createdAt).toLocaleString()}</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-700">Last Updated</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{new Date(quotation.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS (Hidden in Print) */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl print:hidden shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-colors min-w-max">
                <Download size={18} />
                Download PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-colors min-w-max"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {quotation.status === 'Draft' && (
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                  <Pencil size={18} />
                  Edit
                </button>
              )}
              
              {(quotation.status === 'Draft' || quotation.status === 'Viewed') && (
                <button 
                  onClick={() => setIsSendModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors shadow-sm"
                >
                  <Send size={18} />
                  Send to Customer
                </button>
              )}

              {quotation.status === 'Accepted' && (
                <button 
                  onClick={() => setIsConvertModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
                >
                  <ShoppingBag size={18} />
                  Convert to Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

        <ConfirmDialog
          isOpen={isConvertModalOpen}
          title="Convert to Order"
          message={`This will create a new order based on Quotation ${quotation.id}. Proceed?`}
          confirmLabel="Yes, convert to order"
          cancelLabel="Cancel"
          onConfirm={handleConvert}
          onClose={() => setIsConvertModalOpen(false)}
          variant="info"
        />

        {/* Send Email Mock Dialog */}
        <ConfirmDialog
          isOpen={isSendModalOpen}
          title="Send Quotation"
          message={`Are you sure you want to send this quotation to the customer?`}
          confirmLabel="Send Email"
          cancelLabel="Cancel"
          onConfirm={handleSend}
          onClose={() => setIsSendModalOpen(false)}
          variant="info"
        />
      </>
      )}
    </Modal>
  );
}
