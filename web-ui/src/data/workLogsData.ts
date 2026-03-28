export interface WorkLogMaterial {
  part_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ComplianceFlag {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface InvoiceItem {
  rate_type: 'normal' | 'scheduled' | 'emergency';
  hourly_rate: number;
  hours_worked: number;
  labor_cost: number;
  materials_cost_before_markup: number;
  material_markup_percentage: number;
  materials_cost: number;
  travel_cost: number;
  travel_note: string;
  total_cost: number;
  requires_approval: boolean;
  certification_verified: boolean;
  certification_detail: string | null;
  validation_notes: string[];
}

export interface WorkLog {
  work_log_id: string;
  logged_by: string;
  customer_id: string;
  customer_name: string;
  contract_id: string;
  site_id: string;
  site_name: string;
  worker_id: string;
  worker_name: string;
  date: string;
  service_category: string;
  work_type: string;
  description: string;
  hours_worked: number;
  status: 'complete' | 'pending_review' | 'approved' | 'rejected';
  billable: boolean;
  billability_reasoning: string;
  compliance_flags: ComplianceFlag[];
  materials_used: WorkLogMaterial[];
  invoice_item: InvoiceItem;
}

export const workLogs: WorkLog[] = [
  {
    work_log_id: 'WL-2026-NPS-S2-002',
    logged_by: 'Ruslan (proxy submission on behalf of W-001)',
    customer_id: 'NPS-001',
    customer_name: 'Nordic Property Services Oy',
    contract_id: 'NPS-2025-FM01',
    site_id: 'NPS-S2',
    site_name: 'Pohjola Business Park (Office Complex)',
    worker_id: 'W-001',
    worker_name: 'Pekka Virtanen',
    date: '2026-03-13',
    service_category: 'HVAC',
    work_type: 'repair',
    description: 'AC compressor repair — run capacitor replacement. Identified and replaced faulty run capacitor (45uF 440V) on AC compressor unit. No refrigerant handling required. System tested and confirmed operational after repair.',
    hours_worked: 4.0,
    status: 'complete',
    billable: true,
    billability_reasoning: 'In-scope repair under HVAC covered work (Compressor repair and replacement), contract NPS-2025-FM01. Worker W-001 holds valid Electrical Safety Certificate S2. No refrigerant involved. Total cost €332.20 — no approval threshold applies under this contract.',
    compliance_flags: [
      {
        type: 'proxy_submission',
        severity: 'info',
        message: 'Work log submitted by Ruslan on behalf of W-001 (Pekka Virtanen). Verify authorization if required.',
      },
      {
        type: 'rate_correction',
        severity: 'info',
        message: 'Submitted hourly rate (€100/hr) did not match contract rate (€75/hr). Corrected to €75/hr. Labor total €300.00 unchanged.',
      },
    ],
    materials_used: [
      { part_id: 'ELC-CAP-01', name: 'Run Capacitor 45uF 440V', quantity: 1, unit_price: 28.00, line_total: 28.00 },
    ],
    invoice_item: {
      rate_type: 'normal',
      hourly_rate: 75.00,
      hours_worked: 4.0,
      labor_cost: 300.00,
      materials_cost_before_markup: 28.00,
      material_markup_percentage: 15,
      materials_cost: 32.20,
      travel_cost: 0.00,
      travel_note: 'Travel included per contract NPS-2025-FM01',
      total_cost: 332.20,
      requires_approval: false,
      certification_verified: true,
      certification_detail: 'Electrical Safety Certificate S2, valid until 2026-12-31',
      validation_notes: [
        'Proxy submission — logged by Ruslan on behalf of Pekka Virtanen (W-001).',
        'Hourly rate corrected from €100/hr (submitted) to €75/hr (contract rate). Labor total €300.00 is correct.',
      ],
    },
  },
  {
    work_log_id: 'WL-2026-FBL-S1-001',
    logged_by: 'W-004',
    customer_id: 'FBL-001',
    customer_name: 'Frostbite Leisure Oy',
    contract_id: 'FBL-2025-REF01',
    site_id: 'FBL-S1',
    site_name: 'FBL Ice Arena',
    worker_id: 'W-004',
    worker_name: 'Sanna Makela',
    date: '2026-03-18',
    service_category: 'Refrigeration',
    work_type: 'emergency_repair',
    description: 'Emergency call — Cold Storage A temperature rising, alarm triggered at -15°C (should be -22°C). Found compressor C-A2 not running. Faulty contactor. Replaced contactor and run capacitor. Compressor restarted, temperature recovering. Remained on site to verify temperature reached -22°C.',
    hours_worked: 4.0,
    status: 'pending_review',
    billable: true,
    billability_reasoning: 'Emergency repair under Refrigeration contract FBL-2025-REF01. Emergency rate applies. Worker W-004 holds Refrigerant Category II certification. Total cost €724.60 — requires manager review per emergency billing policy.',
    compliance_flags: [
      {
        type: 'emergency_rate',
        severity: 'warning',
        message: 'Emergency call-out rate applied (€120/hr). Manager review required before invoicing.',
      },
    ],
    materials_used: [
      { part_id: 'ELC-CONT-01', name: 'Compressor Contactor 40A 3-pole', quantity: 1, unit_price: 55.00, line_total: 55.00 },
      { part_id: 'ELC-CAP-01', name: 'Run Capacitor 45uF 440V', quantity: 1, unit_price: 28.00, line_total: 28.00 },
    ],
    invoice_item: {
      rate_type: 'emergency',
      hourly_rate: 120.00,
      hours_worked: 4.0,
      labor_cost: 480.00,
      materials_cost_before_markup: 83.00,
      material_markup_percentage: 15,
      materials_cost: 95.45,
      travel_cost: 45.00,
      travel_note: 'Emergency call-out travel surcharge applied',
      total_cost: 724.60,
      requires_approval: true,
      certification_verified: true,
      certification_detail: 'Refrigerant Category II, valid until 2027-06-30',
      validation_notes: [
        'Emergency rate applied per contract clause 8.2.',
        'Manager approval required before invoice is issued.',
      ],
    },
  },
  {
    work_log_id: 'WL-2026-GFS-S1-001',
    logged_by: 'W-002',
    customer_id: 'GFS-001',
    customer_name: 'City of Greenfield',
    contract_id: 'GFS-2025-SCH01',
    site_id: 'GFS-S1',
    site_name: 'Greenfield Primary School',
    worker_id: 'W-002',
    worker_name: 'Janne Korhonen',
    date: '2026-03-20',
    service_category: 'Minor Plumbing',
    work_type: 'repair',
    description: 'Two toilets in boys restroom (2nd floor) running continuously. Replaced fill valves and flappers in both. Tested flush cycles — all working normally.',
    hours_worked: 1.5,
    status: 'approved',
    billable: true,
    billability_reasoning: 'Standard minor plumbing repair covered under GFS-2025-SCH01. Materials and labour within per-incident cost threshold. No certification required.',
    compliance_flags: [],
    materials_used: [
      { part_id: 'PLB-FILL-01', name: 'Toilet Fill Valve Universal', quantity: 2, unit_price: 15.50, line_total: 31.00 },
      { part_id: 'PLB-FLAP-01', name: 'Toilet Flapper Valve 2"', quantity: 2, unit_price: 6.80, line_total: 13.60 },
    ],
    invoice_item: {
      rate_type: 'normal',
      hourly_rate: 55.00,
      hours_worked: 1.5,
      labor_cost: 82.50,
      materials_cost_before_markup: 44.60,
      material_markup_percentage: 15,
      materials_cost: 51.29,
      travel_cost: 0.00,
      travel_note: 'Travel included per contract GFS-2025-SCH01',
      total_cost: 142.06,
      requires_approval: false,
      certification_verified: false,
      certification_detail: null,
      validation_notes: [],
    },
  },
];
