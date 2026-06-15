import { useRoleAccess } from '../hooks/useRoleAccess';
import { User, Mail, Shield, Key } from 'lucide-react';

export default function Profile() {
  const { user, roleName } = useRoleAccess();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-3xl font-bold uppercase">
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
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
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
            <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
