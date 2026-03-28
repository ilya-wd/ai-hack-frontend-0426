import workersData from '../data/workers.json';

interface Props {
  value: string;
  onChange: (workerId: string) => void;
}

export function WorkerSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">Logged in as</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-sm font-semibold text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
      >
        <option value="">— select worker —</option>
        {(workersData as any).workers.map((w: any) => (
          <option key={w.worker_id} value={w.worker_id}>
            {w.name} ({w.role})
          </option>
        ))}
      </select>
    </div>
  );
}
