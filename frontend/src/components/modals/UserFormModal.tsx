import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const isEditMode = !!userId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [roles, setRoles] = useState<{id: string, displayName: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (isEditMode) {
        fetchUserDetails();
      } else {
        resetForm();
      }
    }
  }, [isOpen, userId]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/v1/users/roles');
      const filteredRoles = (response.data.data || []).filter(
        (r: any) => r.name !== 'Customer' && r.displayName !== 'Customer'
      );
      
      setRoles(filteredRoles);
      
      if (!isEditMode && filteredRoles.length > 0) {
        setRoleId(filteredRoles[0].id);
      }
    } catch (err) {
      console.error('Failed to load roles', err);
    }
  };

  const fetchUserDetails = async () => {
    setFetchingData(true);
    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      const user = response.data.data || response.data;
      
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRoleId(user.roleId || '');
      setStatus(user.status || 'Active');
      setPassword(''); // Don't show password
    } catch (err) {
      error('Error', 'Failed to load user details');
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setStatus('Active');
    if (roles.length > 0) setRoleId(roles[0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      fullName,
      email,
      phone: phone || undefined,
      roleId,
      status
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (isEditMode) {
        await api.patch(`/api/v1/users/${userId}`, payload);
        success('User Updated', `${fullName} has been updated successfully.`);
      } else {
        await api.post('/api/v1/users', payload);
        success('User Added', `${fullName} has been added successfully.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to save user', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Staff / User' : 'Add New Staff / User'}
      size="md"
    >
      {fetchingData ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              required={!isEditMode}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder={isEditMode ? '••••••••' : 'Enter password (min 8 chars)'}
              minLength={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="+62 812-3456-7890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                required
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                {roles.length === 0 ? (
                  <option value="" disabled>Loading roles...</option>
                ) : (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))
                )}
              </select>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save User'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
