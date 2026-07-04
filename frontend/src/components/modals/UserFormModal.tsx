// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string | null;
}

const getUserSchema = (isEditMode: boolean) => z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: isEditMode 
    ? z.string().optional().or(z.literal('')) 
    : z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'Suspended']).default('Active'),
});

type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;

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
  const [roles, setRoles] = useState<{id: string, displayName: string}[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(getUserSchema(isEditMode)),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
      status: 'Active',
    }
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/api/v1/users/roles');
        const filteredRoles = (response.data.data || []).filter(
          (r: { name: string; displayName: string }) => r.name !== 'Customer' && r.displayName !== 'Customer'
        );
        
        setRoles(filteredRoles);
        
        if (!isEditMode && filteredRoles.length > 0) {
          setValue('roleId', filteredRoles[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load roles', err);
      }
    };

    const fetchUserDetails = async () => {
      setFetchingData(true);
      try {
        const response = await api.get(`/api/v1/users/${userId}`);
        const user = response.data.data || response.data;
        
        reset({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          roleId: user.roleId || '',
          status: user.status || 'Active',
          password: '',
        });
      } catch {
        error('Error', 'Failed to load user details');
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    if (isOpen) {
      fetchRoles();
      if (isEditMode) {
        fetchUserDetails();
      } else {
        reset({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          roleId: roles.length > 0 ? roles[0].id : '',
          status: 'Active',
        });
      }
    }
  }, [isOpen, userId, isEditMode, error, onClose, reset, setValue, roles]); // Need to be careful with roles dependency here

  const onSubmit = async (data: any) => {
    setLoading(true);

    const payload: Record<string, string | undefined> = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      roleId: data.roleId,
      status: data.status
    };

    if (data.password) {
      payload.password = data.password;
    }

    try {
      if (isEditMode) {
        await api.patch(`/api/v1/users/${userId}`, payload);
        success('User Updated', `${data.fullName} has been updated successfully.`);
      } else {
        await api.post('/api/v1/users', payload);
        success('User Added', `${data.fullName} has been added successfully.`);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. John Doe"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isEditMode ? '••••••••' : 'Enter password (min 8 chars)'}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              {...register('phone')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+62 812-3456-7890"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                {...register('roleId')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="" disabled>Select a role...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.displayName}
                  </option>
                ))}
              </select>
              {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
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
