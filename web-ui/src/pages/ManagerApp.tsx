import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { workLogs } from '../data/workLogsData';
import type { WorkLog } from '../data/workLogsData';

const STATUS_STYLES: Record<string, string> = {
  complete: 'bg-green-100 text-green-700',
  approved: 'bg-blue-100 text-blue-700',
  pending_review: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  complete: 'Complete',
  approved: 'Approved',
  pending_review: 'Pending Review',
  rejected: 'Rejected',
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const SEVERITY_ICON: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '🚨',
};

const RATE_TYPE_LABEL: Record<string, string> = {
  normal: 'Normal rate',
  scheduled: 'Scheduled rate',
  emergency: 'Emergency rate',
};

function WorkLogCard({ log }: { log: WorkLog }) {
  const [expanded, setExpanded] = useState(false);
  const inv = log.invoice_item;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header — always visible */}
      <button
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono text-gray-400">{log.work_log_id}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[log.status] ?? log.status}
            </span>
            {log.compliance_flags.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {log.compliance_flags.length} flag{log.compliance_flags.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-sm">{log.worker_name}</p>
          <p className="text-xs text-gray-500 truncate">{log.customer_name} · {log.site_name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">€{inv.total_cost.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{log.date}</p>
          <p className="text-xs text-gray-400 mt-1">{expanded ? '▲' : '▼'}</p>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">

          {/* Work details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Work Details</p>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{log.service_category}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{log.work_type.replace('_', ' ')}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{log.hours_worked}h</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{log.description}</p>
            <p className="text-xs text-gray-400 mt-1">Logged by: {log.logged_by}</p>
          </div>

          {/* Invoice breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Invoice</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Labour ({RATE_TYPE_LABEL[inv.rate_type]})</span>
                <span>€{inv.hourly_rate}/hr × {inv.hours_worked}h = €{inv.labor_cost.toFixed(2)}</span>
              </div>
              {inv.materials_cost_before_markup > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Materials (+{inv.material_markup_percentage}% markup)</span>
                  <span>€{inv.materials_cost.toFixed(2)}</span>
                </div>
              )}
              {inv.travel_cost > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Travel</span>
                  <span>€{inv.travel_cost.toFixed(2)}</span>
                </div>
              )}
              {inv.travel_cost === 0 && (
                <p className="text-xs text-gray-400">{inv.travel_note}</p>
              )}
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1.5">
                <span>Total</span>
                <span>€{inv.total_cost.toFixed(2)}</span>
              </div>
            </div>
            {inv.certification_verified && inv.certification_detail && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-green-700">
                <span>✓</span>
                <span>{inv.certification_detail}</span>
              </div>
            )}
            {inv.requires_approval && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 font-medium">
                <span>⚠️</span>
                <span>Manager approval required before invoicing</span>
              </div>
            )}
          </div>

          {/* Materials */}
          {log.materials_used.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Materials Used</p>
              <div className="space-y-1">
                {log.materials_used.map(m => (
                  <div key={m.part_id} className="flex justify-between text-sm text-gray-700">
                    <span>{m.name} × {m.quantity}</span>
                    <span className="text-gray-500">€{m.line_total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance flags */}
          {log.compliance_flags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Compliance Flags</p>
              <div className="space-y-1.5">
                {log.compliance_flags.map((flag, i) => (
                  <div key={i} className={`flex gap-2 text-xs border rounded-lg px-3 py-2 ${SEVERITY_STYLES[flag.severity]}`}>
                    <span>{SEVERITY_ICON[flag.severity]}</span>
                    <span>{flag.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billability reasoning */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Billability</p>
            <p className="text-xs text-gray-600 leading-relaxed">{log.billability_reasoning}</p>
          </div>

          {/* Validation notes */}
          {inv.validation_notes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Agent Notes</p>
              <ul className="space-y-0.5">
                {inv.validation_notes.map((note, i) => (
                  <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                    <span>•</span><span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerApp() {
  const totalHours = workLogs.reduce((s, l) => s + l.hours_worked, 0);
  const totalRevenue = workLogs.reduce((s, l) => s + l.invoice_item.total_cost, 0);
  const pendingReview = workLogs.filter(l => l.status === 'pending_review').length;

  return (
    <div className="flex flex-col h-[100svh] w-full sm:max-w-lg sm:mx-auto bg-white sm:shadow-sm">
      <AppHeader />

      <div className="flex-1 overflow-y-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{workLogs.length}</p>
            <p className="text-xs text-blue-500 mt-0.5">Total jobs</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingReview}</p>
            <p className="text-xs text-amber-500 mt-0.5">Pending review</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700">€{totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-green-500 mt-0.5">{totalHours}h logged</p>
          </div>
        </div>

        {/* Work log list */}
        <div className="px-4 pb-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Work Logs</h2>
          {workLogs.map(log => (
            <WorkLogCard key={log.work_log_id} log={log} />
          ))}
        </div>
      </div>
    </div>
  );
}
