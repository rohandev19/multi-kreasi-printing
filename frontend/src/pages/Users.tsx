import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { UsersTable, type User } from '../components/tables/UsersTable';
import { UserFormModal } from '../components/modals/UserFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { Plus, Search } from 'lucide-react';

export default function Users() {
  const { role, loading: roleLoading } = useRoleContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination (simplified)
  const [page, setPage] = useState(1);
  const limit = 100; // Load up to 100 users for simplicity

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users', {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined
        }
      });
      setUsers(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchUsers();
    }
  }, [role, roleLoading, fetchUsers]);

  const handleAddUser = () => {
    setSelectedUserId(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (id: string) => {
    setSelectedUserId(id);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/users/${deleteId}`);
      success('User Deleted', 'The user account has been deleted.');
      fetchUsers();
    } catch (err: any) {
      toastError('Failed to delete', err.response?.data?.message || 'Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Double check authorization
  if (role !== 'Owner' && role !== 'Manager') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900">Access Denied</h3>
        <p className="text-slate-500 mt-1">You do not have permission to view staff management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Users</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system access and roles for your team</p>
        </div>
        <button
          onClick={handleAddUser}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            {error}
          </div>
        ) : (
          <div className="p-0 sm:p-4">
            <UsersTable
              users={users}
              userRole={role || ''}
              loading={loading}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchUsers}
        userId={selectedUserId}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete User Account"
        message="Are you sure you want to delete this user? They will lose access immediately. This action cannot be undone."
        confirmLabel="Yes, Delete User"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
