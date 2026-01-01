export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        <span className="text-lg font-medium text-slate-700">Overview</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="w-9 h-9 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold shadow-inner">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
