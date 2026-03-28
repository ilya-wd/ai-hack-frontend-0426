import type { Material, ComplianceFlag } from './index';

export interface FormState {
  // Core fields (always visible)
  worker_id: string;
  customer_id: string;
  site_id: string;
  service_category: string;
  description: string;
  hours: string;
  date: string;

  // Dynamic section data
  materials: Material[];
  compliance_flags: ComplianceFlag[];
  approval_notes: string;
  certification_verified: boolean | null;
}

export interface DynamicSections {
  showMaterials: boolean;
  showCompliance: boolean;
  showApproval: boolean;
  showCertification: boolean;
}

export type FieldStatus = 'empty' | 'filled' | 'needs-clarification';

export const initialFormState: FormState = {
  worker_id: '',
  customer_id: '',
  site_id: '',
  service_category: '',
  description: '',
  hours: '',
  date: new Date().toISOString().split('T')[0],
  materials: [],
  compliance_flags: [],
  approval_notes: '',
  certification_verified: null,
};

export const initialDynamicSections: DynamicSections = {
  showMaterials: false,
  showCompliance: false,
  showApproval: false,
  showCertification: false,
};
