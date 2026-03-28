import contractsData from '../../data/contracts.json';
import type { FormState } from '../../types/form';

interface Props {
  customer_id: FormState['customer_id'];
  service_category: FormState['service_category'];
  onChange: (category: string) => void;
}

const customers = (contractsData as any).customers ?? [];

export function ServiceCategorySelector({ customer_id, service_category, onChange }: Props) {
  const selected = customers.find((c: any) => c.customer_id === customer_id);
  const categories: Array<{ category: string }> = selected?.contract?.service_categories ?? [];

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Service Category</label>
      <select
        value={service_category}
        onChange={e => onChange(e.target.value)}
        disabled={!customer_id}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="">Select category…</option>
        {categories.map(({ category }) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
}
