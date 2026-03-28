import contractsData from '../../data/contracts.json';
import type { FormState } from '../../types/form';

interface Props {
  customer_id: FormState['customer_id'];
  site_id: FormState['site_id'];
  onCustomerChange: (id: string) => void;
  onSiteChange: (id: string) => void;
}

const customers = (contractsData as any).customers ?? [];

export function CustomerSiteSelector({ customer_id, site_id, onCustomerChange, onSiteChange }: Props) {
  const selected = customers.find((c: any) => c.customer_id === customer_id);
  const sites: any[] = selected?.contract?.sites ?? [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
        <select
          value={customer_id}
          onChange={e => { onCustomerChange(e.target.value); onSiteChange(''); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select customer…</option>
          {customers.map((c: any) => (
            <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Site</label>
        <select
          value={site_id}
          onChange={e => onSiteChange(e.target.value)}
          disabled={!customer_id}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">Select site…</option>
          {sites.map((s: any) => (
            <option key={s.site_id} value={s.site_id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
