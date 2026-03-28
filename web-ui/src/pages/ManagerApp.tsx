import { AppHeader } from '../components/AppHeader';

const PLACEHOLDER_LOGS = [
  { id: 'WL-001', worker: 'Pekka Virtanen', customer: 'City of Greenfield', site: 'Greenfield Primary', category: 'Minor Plumbing', hours: 1.5, date: '2026-03-28', status: 'submitted' },
  { id: 'WL-002', worker: 'Janne Korhonen', customer: 'Frostbite Leisure', site: 'FBL Ice Arena', category: 'Refrigeration', hours: 3.0, date: '2026-03-27', status: 'approved' },
  { id: 'WL-003', worker: 'Sanna Makela', customer: 'Nordic Property Services', site: 'NPS Shopping Center', category: 'HVAC', hours: 2.0, date: '2026-03-26', status: 'submitted' },
];

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ManagerApp() {
  const totalHours = PLACEHOLDER_LOGS.reduce((s, l) => s + l.hours, 0);
  const totalJobs = PLACEHOLDER_LOGS.length;
  const pendingReview = PLACEHOLDER_LOGS.filter(l => l.status === 'submitted').length;

  return (
    <div className="flex flex-col h-[100svh] w-full sm:max-w-lg sm:mx-auto bg-white sm:shadow-sm">
      <AppHeader />

      <div className="flex-1 overflow-y-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalJobs}</p>
            <p className="text-xs text-blue-500 mt-0.5">Total jobs</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingReview}</p>
            <p className="text-xs text-amber-500 mt-0.5">Pending review</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{totalHours}h</p>
            <p className="text-xs text-gray-500 mt-0.5">Hours logged</p>
          </div>
        </div>

        {/* Work log list */}
        <div className="px-4 pb-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Work Logs</h2>
          {PLACEHOLDER_LOGS.map(log => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">{log.id}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {log.status}
                </span>
              </div>
              <p className="font-medium text-gray-900 text-sm">{log.worker}</p>
              <p className="text-xs text-gray-500">{log.customer} · {log.site}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{log.category}</span>
                <span>{log.hours}h · {log.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon banner */}
        <div className="mx-4 mb-6 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-400">
          <p className="font-medium text-gray-500 mb-1">Billing & Analytics</p>
          <p>Full invoice generation, compliance review, and cost breakdowns will be available after Nanoclaw integration.</p>
        </div>
      </div>
    </div>
  );
}
