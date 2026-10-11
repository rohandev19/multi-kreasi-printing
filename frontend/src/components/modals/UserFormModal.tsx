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
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: isEditMode 
    ? z.string().optional().or(z.literal('')) 
    : z.string().min(8, 'Kata sandi minimal 8 karakter'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Peran wajib dipilih'),
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
        error('Kesalahan', 'Gagal memuat detail pengguna');
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
  }, [isOpen, userId, isEditMode, error, onClose, reset, setValue, roles]);

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
        success('Pengguna Diperbarui', `${data.fullName} berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/users', payload);
        success('Pengguna Ditambahkan', `${data.fullName} berhasil ditambahkan.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal menyimpan pengguna', err.response?.data?.message || 'Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Staf / Pengguna' : 'Tambah Staf / Pengguna Baru'}
      size="md"
    >
      {fetchingData ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              {...register('fullName')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="cth. Budi Santoso"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="budi@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Kata Sandi (kosongkan jika tidak diubah)' : 'Kata Sandi'}
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isEditMode ? '••••••••' : 'Masukkan kata sandi (min 8 karakter)'}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon (Opsional)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Peran</label>
              <select
                {...register('roleId')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="" disabled>Pilih peran...</option>
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
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Nonaktif</option>
                  <option value="Suspended">Ditangguhkan</option>
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
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
