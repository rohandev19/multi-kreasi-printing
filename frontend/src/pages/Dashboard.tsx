export default function Dashboard() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Orders</h3>
          <p className="text-4xl font-bold mt-2 text-slate-800">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">In Production</h3>
          <p className="text-4xl font-bold mt-2 text-blue-600">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Revenue Today</h3>
          <p className="text-4xl font-bold mt-2 text-emerald-600">Rp 12.5M</p>
        </div>
      </div>
    </div>
  );
}
