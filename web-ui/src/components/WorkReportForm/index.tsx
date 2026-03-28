import type { FormState, DynamicSections } from '../../types/form';
import type { Material } from '../../types';
import { CustomerSiteSelector } from './CustomerSiteSelector';
import { ServiceCategorySelector } from './ServiceCategorySelector';
import { DynamicSection } from './DynamicSection';
import { MaterialsList } from './MaterialsList';
import { ComplianceFlags } from './ComplianceFlags';
import { ClarificationBanner } from './ClarificationBanner';

interface Props {
  form: FormState;
  sections: DynamicSections;
  clarification: string | null;
  isLoading: boolean;
  onFieldChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export function WorkReportForm({ form, sections, clarification, isLoading, onFieldChange }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

      {/* Core fields */}
      <CustomerSiteSelector
        customer_id={form.customer_id}
        site_id={form.site_id}
        onCustomerChange={v => onFieldChange('customer_id', v)}
        onSiteChange={v => onFieldChange('site_id', v)}
      />

      <ServiceCategorySelector
        customer_id={form.customer_id}
        service_category={form.service_category}
        onChange={v => onFieldChange('service_category', v)}
      />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => onFieldChange('description', e.target.value)}
          placeholder="Describe the work done…"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hours Worked</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.hours}
            onChange={e => onFieldChange('hours', e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => onFieldChange('date', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dynamic sections */}
      <DynamicSection visible={sections.showMaterials}>
        <MaterialsList
          materials={form.materials}
          onChange={v => onFieldChange('materials', v as Material[])}
        />
      </DynamicSection>

      <DynamicSection visible={sections.showCompliance || sections.showApproval}>
        <ComplianceFlags
          flags={form.compliance_flags}
          approvalNotes={form.approval_notes}
          onApprovalNotesChange={v => onFieldChange('approval_notes', v)}
          showApproval={sections.showApproval}
        />
      </DynamicSection>

      <DynamicSection visible={sections.showCertification && form.certification_verified !== null}>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
          <span className="text-green-600">✓</span>
          <p className="text-sm text-green-800">Certification verified</p>
        </div>
      </DynamicSection>

      {/* Clarification banner */}
      {clarification && !isLoading && (
        <ClarificationBanner question={clarification} />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Agent is thinking…
        </div>
      )}
    </div>
  );
}
