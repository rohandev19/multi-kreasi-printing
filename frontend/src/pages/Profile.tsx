import { useState } from 'react';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { User, Mail, Shield, Key, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../api/axios';

export default function Profile() {
  const { user, roleName } = useRoleAccess();
  const { success, error: showError } = useToast();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      });
      success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
        <div className="px-8 flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
            <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full text-3xl font-bold uppercase">
              {(user?.fullName || user?.name || 'G').charAt(0)}
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{user?.fullName || user?.name || 'Guest User'}</h1>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user?.email || 'No email provided'}
            </p>
          </div>
          <div>
            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {roleName.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" /> Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
              <div className="text-slate-800 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                {user?.fullName || user?.name || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
              <div className="text-slate-800 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                {user?.email || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Account Role</label>
              <div className="text-slate-800 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100 capitalize">
                {roleName.replace('_', ' ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Account Status</label>
              <div className="text-emerald-700 font-medium p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                Active
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-400" /> Security
          </h2>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-800">Password</h3>
              <p className="text-sm text-slate-500">Last changed recently</p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Change Password</h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Must match new password"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
