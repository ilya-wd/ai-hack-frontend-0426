import type { Material } from '../../types';

interface Props {
  materials: Material[];
  onChange: (materials: Material[]) => void;
}

export function MaterialsList({ materials, onChange }: Props) {
  const remove = (index: number) => {
    onChange(materials.filter((_, i) => i !== index));
  };

  const addBlank = () => {
    onChange([...materials, { part_id: '', name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const update = (index: number, field: keyof Material, value: string | number) => {
    const updated = materials.map((m, i) => {
      if (i !== index) return m;
      const next = { ...m, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        next.total_price = Number(next.quantity) * Number(next.unit_price);
      }
      return next;
    });
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-500">Materials / Parts</label>
        <span className="text-xs text-gray-400">
          Total: €{materials.reduce((s, m) => s + m.total_price, 0).toFixed(2)}
        </span>
      </div>
      <div className="space-y-2">
        {materials.map((m, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              {m.part_id ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">
                    {m.quantity} × €{m.unit_price.toFixed(2)} = €{m.total_price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Part name…"
                  value={m.name}
                  onChange={e => update(i, 'name', e.target.value)}
                  className="w-full text-sm bg-transparent border-0 focus:outline-none p-0 text-gray-900"
                />
              )}
            </div>
            {!m.part_id && (
              <input
                type="number"
                min="1"
                value={m.quantity}
                onChange={e => update(i, 'quantity', Number(e.target.value))}
                className="w-12 text-sm text-center rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            <button
              onClick={() => remove(i)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none ml-1"
              aria-label="Remove material"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addBlank}
        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add material
      </button>
    </div>
  );
}
