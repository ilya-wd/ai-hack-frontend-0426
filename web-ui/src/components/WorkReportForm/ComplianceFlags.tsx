import type { ComplianceFlag } from '../../types';

const severityStyles: Record<string, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const severityIcon: Record<string, string> = {
  error: '🚨',
  warning: '⚠️',
  info: 'ℹ️',
};

interface Props {
  flags: ComplianceFlag[];
  approvalNotes: string;
  onApprovalNotesChange: (notes: string) => void;
  showApproval: boolean;
}

export function ComplianceFlags({ flags, approvalNotes, onApprovalNotesChange, showApproval }: Props) {
  return (
    <div className="space-y-3">
      {flags.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Compliance</label>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <div key={i} className={`rounded-lg border px-3 py-2.5 text-sm ${severityStyles[flag.severity]}`}>
                <div className="flex gap-2">
                  <span>{severityIcon[flag.severity]}</span>
                  <div>
                    <p className="font-medium">{flag.description}</p>
                    {flag.action_required && (
                      <p className="text-xs mt-0.5 opacity-80">{flag.action_required}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showApproval && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Approval Notes</label>
          <input
            type="text"
            value={approvalNotes}
            onChange={e => onApprovalNotesChange(e.target.value)}
            placeholder="e.g. Verbal approval from Reijo Makinen"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
