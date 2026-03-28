export interface Worker {
  worker_id: string;
  name: string;
  role: string;
  certifications: Certification[];
  specializations: string[];
  assigned_customers: string[];
}

export interface Certification {
  type: string;
  category?: string;
  class?: string;
  valid_until: string;
}

export interface Site {
  site_id: string;
  name: string;
  address?: string;
}

export interface Contract {
  customer_id: string;
  customer_name: string;
  contract_id: string;
  sites: Site[];
  service_categories: string[];
}

export interface Material {
  part_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  source?: 'catalog' | 'non-catalog';
}

export interface ComplianceFlag {
  type: 'certification' | 'hours' | 'scope' | 'cost' | 'duplicate';
  severity: 'info' | 'warning' | 'error';
  description: string;
  action_required?: string;
}

export interface ChatMessage {
  id: string;
  role: 'worker' | 'agent';
  content: string;
  timestamp: Date;
}
