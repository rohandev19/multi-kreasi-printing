import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { useRoleContext } from '../../contexts/RoleContext';
import {
  Tag,
  Clock,
  CheckCircle,
  PaperPlaneTilt,
  WarningCircle,
  Buildings,
  User,
  ArrowClockwise,
} from '@phosphor-icons/react';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  onUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  onUpdated,
}) => {
  const { role } = useRoleContext();
  const { success, error: toastError } = useToast();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaff = role ? ['Owner', 'Manager', 'Sales', 'Production_Staff'].includes(role) : false;

  const fetchTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (err: any) {
      toastError('Gagal Memuat Tiket', err.response?.data?.message || 'Gagal memuat rincian tiket');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
    } else {
      setTicket(null);
      setReplyText('');
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    if (ticket?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticketId) return;

    setSendingReply(true);
    try {
      await api.post(`/api/v1/tickets/${ticketId}/messages`, {
        message: replyText.trim(),
      });
      setReplyText('');
      await fetchTicket();
      onUpdated();
      success('Pesan Terkirim', 'Balasan Anda berhasil ditambahkan ke percakapan tiket.');
    } catch (err: any) {
      toastError('Gagal Mengirim', err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/v1/tickets/${ticketId}`, { status: newStatus });
      await fetchTicket();
      onUpdated();
      success('Status Diperbarui', `Status tiket diubah menjadi ${newStatus}`);
    } catch (err: any) {
      toastError('Gagal Update Status', err.response?.data?.message || 'Gagal memperbarui status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticketId) return;
    try {
      await api.patch(`/api/v1/tickets/${ticketId}`, { priority: newPriority });
      await fetchTicket();
      onUpdated();
      success('Prioritas Diperbarui', `Prioritas tiket diubah menjadi ${newPriority}`);
    } catch (err: any) {
      toastError('Gagal Update Prioritas', err.response?.data?.message || 'Gagal memperbarui prioritas');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      Open: { label: 'Terbuka', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      Assigned: { label: 'Ditugaskan', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
      In_Progress: { label: 'Diproses', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
      Resolved: { label: 'Terselesaikan', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
      Closed: { label: 'Ditutup', bg: 'bg-neutral-100 border-neutral-300', text: 'text-neutral-700' },
      Reopened: { label: 'Dibuka Kembali', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    };
    const c = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      Low: { label: 'Low', bg: 'bg-neutral-100', text: 'text-neutral-700' },
      Normal: { label: 'Normal', bg: 'bg-sky-100', text: 'text-sky-800' },
      High: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-800' },
      Urgent: { label: 'Urgent', bg: 'bg-rose-100 ring-1 ring-rose-400', text: 'text-rose-800 font-bold' },
    };
    const c = config[priority] || { label: priority, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${c.bg} ${c.text}`}>
        {priority === 'Urgent' && <WarningCircle size={12} weight="fill" className="animate-pulse" />}
        {c.label}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `${ticket.ticketNumber} — ${ticket.subject}` : 'Detail Tiket Bantuan'}
    >
      {loading || !ticket ? (
        <div className="py-12 text-center text-sm text-[var(--text-secondary)] flex flex-col items-center gap-2">
          <ArrowClockwise size={24} className="animate-spin text-neutral-500" />
          Memuat riwayat tiket...
        </div>
      ) : (
        <div className="space-y-4 max-h-[75vh] flex flex-col">
          {/* Header meta */}
          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-200/60 font-medium">
                  <Tag size={12} />
                  {ticket.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                <Clock size={14} />
                <span>Dibuat: {new Date(ticket.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--border-default)]/60 text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Buildings size={14} />
                <span>Pelanggan: <strong className="text-[var(--text-primary)]">{ticket.customer?.companyName || ticket.user?.fullName || 'Umum'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>Ditugaskan: <strong className="text-[var(--text-primary)]">{ticket.assignedTo?.fullName || 'Belum Ditugaskan'}</strong></span>
              </div>
            </div>

            {ticket.order && (
              <div className="text-xs pt-1 text-[var(--text-secondary)]">
                Pesanan Terkait: <span className="font-semibold text-black">#{ticket.order.orderNumber}</span>
              </div>
            )}
          </div>

          {/* Staff controls */}
          {isStaff && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Ubah Status:</span>
                <select
                  disabled={updatingStatus}
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-primary)] font-medium"
                >
                  <option value="Open">Terbuka (Open)</option>
                  <option value="Assigned">Ditugaskan (Assigned)</option>
                  <option value="In_Progress">Sedang Diproses (In Progress)</option>
                  <option value="Resolved">Selesai (Resolved)</option>
                  <option value="Closed">Tutup Tiket (Closed)</option>
                  <option value="Reopened">Buka Kembali (Reopened)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Prioritas:</span>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-primary)] font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] min-h-[220px] max-h-[340px]">
            {ticket.messages?.map((msg: any) => {
              const isStaffSender = ['Owner', 'Manager', 'Sales', 'Production_Staff'].includes(msg.senderRole);
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-sm max-w-[85%] ${
                    isStaffSender
                      ? 'ml-auto bg-neutral-900 text-white border-neutral-800'
                      : 'mr-auto bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-xs opacity-80">
                    <span className="font-semibold flex items-center gap-1">
                      {msg.senderName}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${isStaffSender ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-200 text-neutral-700'}`}>
                        {msg.senderRole}
                      </span>
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Tulis balasan atau pesan Anda..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={sendingReply || !replyText.trim()}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <PaperPlaneTilt size={16} />
              <span>{sendingReply ? 'Mengirim...' : 'Balas'}</span>
            </button>
          </form>

          {ticket.status === 'Resolved' && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
              <span>Tiket ini ditandai selesai. Membalas pesan akan secara otomatis membuka kembali tiket ini jika masih ada kendala lanjutan.</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
