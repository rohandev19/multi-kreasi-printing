import React from 'react';
import { NotePencil, Trash } from '@phosphor-icons/react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  role: {
    name: string;
    displayName: string;
  };
}

interface UsersTableProps {
  users: User[];
  userRole: string;
  loading: boolean;
  onEditUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-gray-100 text-gray-700',
  Suspended: 'bg-red-100 text-red-700',
};

const roleColors: Record<string, string> = {
  Owner: 'bg-primary-100 text-primary-700',
  Manager: 'bg-blue-100 text-blue-700',
  Production_Staff: 'bg-orange-100 text-orange-700',
  Designer: 'bg-pink-100 text-pink-700',
  Warehouse_Staff: 'bg-amber-100 text-amber-700',
  Finance_Staff: 'bg-teal-100 text-teal-700',
  Customer: 'bg-slate-100 text-slate-700',
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  userRole,
  loading,
  onEditUser,
  onDeleteUser,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only Owner and Manager can manage users
  const canManage = userRole === 'Owner' || userRole === 'Manager';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-900">{user.fullName}</div>
                <div className="text-sm text-slate-500">{user.email}</div>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[user.status] || 'bg-gray-100 text-gray-700'}`}>
                {user.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500 mr-2">Role:</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${roleColors[user.role?.name] || 'bg-slate-100 text-slate-700'}`}>
                  {user.role?.displayName || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Phone:</span>
                {user.phone || '-'}
              </div>
            </div>
            
            {canManage && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onEditUser(user.id)}
                  className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit User"
                >
                  <NotePencil size={16} weight="regular" />
                </button>
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete User"
                >
                  <Trash size={16} weight="regular" />
                </button>
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No users found
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                <th className="py-3 px-4 font-medium text-slate-600">Name</th>
                <th className="py-3 px-4 font-medium text-slate-600">Email</th>
                <th className="py-3 px-4 font-medium text-slate-600">Phone</th>
                <th className="py-3 px-4 font-medium text-slate-600">Role</th>
                <th className="py-3 px-4 font-medium text-slate-600">Status</th>
                {canManage && <th className="py-3 px-4 font-medium text-slate-600 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{user.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3 px-4 text-slate-600">{user.phone || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${roleColors[user.role?.name] || 'bg-slate-100 text-slate-700'}`}>
                      {user.role?.displayName || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[user.status] || 'bg-gray-100 text-gray-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onEditUser(user.id)}
                        className="inline-flex items-center p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <NotePencil size={16} weight="regular" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="inline-flex items-center p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash size={16} weight="regular" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="py-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
