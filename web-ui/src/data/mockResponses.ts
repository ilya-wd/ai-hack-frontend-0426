import type { AgentResponse } from '../types/agent';
import type { FormState } from '../types/form';

// Simulate keyword-based field extraction from speech
export function extractFieldUpdates(text: string, currentForm: FormState): Partial<FormState> {
  const lower = text.toLowerCase();
  const updates: Partial<FormState> = {};

  // Customer detection
  if (lower.includes('greenfield')) {
    updates.customer_id = 'GFS-001';
    if (lower.includes('primary') || lower.includes('school')) {
      updates.site_id = 'GFS-S1';
    } else if (lower.includes('secondary')) {
      updates.site_id = 'GFS-S2';
    } else if (lower.includes('sports')) {
      updates.site_id = 'GFS-S3';
    }
  } else if (lower.includes('frostbite') || lower.includes('frost bite')) {
    updates.customer_id = 'FBL-001';
    updates.site_id = 'FBL-S1';
  } else if (lower.includes('nordic') || lower.includes('kauppakeskus') || lower.includes('shopping center')) {
    updates.customer_id = 'NPS-001';
    updates.site_id = 'NPS-S1';
  }

  // Service category detection
  if (lower.includes('toilet') || lower.includes('pipe') || lower.includes('plumb') || lower.includes('drain') || lower.includes('valve')) {
    updates.service_category = 'Minor Plumbing';
  } else if (lower.includes('hvac') || lower.includes('heat pump') || lower.includes('expansion valve') || lower.includes('refriger')) {
    updates.service_category = 'HVAC';
  } else if (lower.includes('electric') || lower.includes('light') || lower.includes('led') || lower.includes('circuit')) {
    updates.service_category = 'Minor Electrical';
  } else if (lower.includes('heating') || lower.includes('boiler') || lower.includes('radiator')) {
    updates.service_category = 'Heating';
  } else if (lower.includes('cooling') || lower.includes('cold storage') || lower.includes('freezer')) {
    updates.service_category = 'Refrigeration';
  } else if (lower.includes('ventilat') || lower.includes('duct') || lower.includes('air')) {
    updates.service_category = 'Ventilation';
  }

  // Hours extraction
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/i);
  if (hoursMatch) {
    updates.hours = hoursMatch[1];
  }
  const halfHourMatch = text.match(/(?:an?\s+)?hour\s+and\s+(?:a\s+)?half/i);
  if (halfHourMatch) updates.hours = '1.5';

  // Description: use the full text if we don't have one yet
  if (!currentForm.description && text.length > 10) {
    updates.description = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return updates;
}

// Simulate what the agent would say and what sections to reveal
export function generateMockResponse(
  text: string,
  updates: Partial<FormState>,
  currentForm: FormState,
): AgentResponse {
  const lower = text.toLowerCase();

  // Check for materials mentions
  const hasMaterials = lower.includes('material') || lower.includes('used') ||
    lower.includes('replaced') || lower.includes('part') || lower.includes('valve') ||
    lower.includes('filter') || lower.includes('pump') || lower.includes('tube') ||
    lower.includes('fitting') || lower.includes('seal');

  // Check for refrigerant (certification required)
  const hasRefrigerant = lower.includes('refrigerant') || lower.includes('r-410') ||
    lower.includes('r-449') || lower.includes('gas') || lower.includes('recharge');

  // Check for out-of-hours
  const hasOutOfHours = lower.includes('evening') || lower.includes('weekend') ||
    lower.match(/\b(6|7|8|9)\s*pm\b/i) !== null || lower.includes('after hours');

  const customerName = updates.customer_id === 'GFS-001' ? 'City of Greenfield - School Facilities' :
    updates.customer_id === 'FBL-001' ? 'FrostBite Logistics Oy' :
    updates.customer_id === 'NPS-001' ? 'Nordic Property Services Oy' : null;

  // Build materials list from speech
  const materials = buildMaterialsFromText(text);

  const response: AgentResponse = {
    message: '',
    fieldUpdates: updates,
    sectionsToShow: {},
    isComplete: false,
  };

  // Determine what clarification is needed
  const missing: string[] = [];
  if (!currentForm.customer_id && !updates.customer_id) missing.push('customer/site');
  if (!currentForm.service_category && !updates.service_category) missing.push('type of work');
  if (!currentForm.hours && !updates.hours) missing.push('how many hours');

  if (missing.length > 0 && Object.keys(updates).length === 0) {
    response.message = `I need a bit more detail. Can you tell me: ${missing.join(', ')}?`;
    response.clarification = `Missing: ${missing.join(', ')}`;
    return response;
  }

  // Build confirmation message
  const parts: string[] = [];
  if (customerName) parts.push(`Customer: ${customerName}`);
  if (updates.site_id) parts.push(`Site: ${getSiteName(updates.site_id)}`);
  if (updates.service_category) parts.push(`Category: ${updates.service_category}`);
  if (updates.hours) parts.push(`Hours: ${updates.hours}h`);

  if (hasMaterials && materials.length > 0) {
    response.fieldUpdates.materials = materials;
    response.sectionsToShow.showMaterials = true;
    parts.push(`Materials: ${materials.map(m => m.name).join(', ')}`);
  } else if (hasMaterials) {
    response.sectionsToShow.showMaterials = true;
    response.clarification = 'What materials or parts did you use? (quantity and type)';
  }

  if (hasRefrigerant) {
    response.sectionsToShow.showCertification = true;
    response.fieldUpdates.certification_verified = true;
  }

  if (hasOutOfHours) {
    response.sectionsToShow.showCompliance = true;
    response.fieldUpdates.compliance_flags = [{
      type: 'hours',
      severity: 'warning',
      description: 'Work reported outside contract service hours (Mon-Fri 08:00-16:00).',
      action_required: 'Confirm verbal approval from facility manager.',
    }];
  }

  if (parts.length > 0) {
    response.message = `Got it. Here's what I have:\n\n${parts.join('\n')}\n\nDoes this look right? Confirm or add any missing details.`;
  } else {
    response.message = 'Can you tell me more about the work — where you were and what you did?';
    response.clarification = 'Need location and work description';
  }

  return response;
}

function getSiteName(siteId: string): string {
  const names: Record<string, string> = {
    'GFS-S1': 'Greenfield Primary School',
    'GFS-S2': 'Greenfield Secondary School',
    'GFS-S3': 'Greenfield Sports Hall',
    'FBL-S1': 'Turku Central Warehouse',
    'NPS-S1': 'Kauppakeskus Pohjola',
  };
  return names[siteId] ?? siteId;
}

function buildMaterialsFromText(text: string): import('../types').Material[] {
  const materials: import('../types').Material[] = [];
  const lower = text.toLowerCase();

  if (lower.includes('fill valve') || lower.includes('toilet valve')) {
    materials.push({ part_id: 'PLB-FILL-01', name: 'Toilet Fill Valve Universal', quantity: 2, unit_price: 15.50, total_price: 31.00 });
  }
  if (lower.includes('flapper')) {
    materials.push({ part_id: 'PLB-FLAP-01', name: 'Toilet Flapper Valve 2"', quantity: 2, unit_price: 6.80, total_price: 13.60 });
  }
  if (lower.includes('led') && (lower.includes('tube') || lower.includes('light'))) {
    materials.push({ part_id: 'FIX-LED-02', name: 'LED Tube T8 1200mm 18W', quantity: 3, unit_price: 8.50, total_price: 25.50 });
  }
  if (lower.includes('expansion valve')) {
    materials.push({ part_id: 'VLV-EXP-01', name: 'Thermal Expansion Valve 3/8"', quantity: 1, unit_price: 85.00, total_price: 85.00 });
  }
  if (lower.includes('r-410') || lower.includes('refrigerant')) {
    materials.push({ part_id: 'REF-R410A', name: 'Refrigerant R-410A (1kg)', quantity: 1.5, unit_price: 45.00, total_price: 67.50 });
  }
  if (lower.includes('flare fitting') || lower.includes('copper fitting')) {
    materials.push({ part_id: 'FIT-FLARE-01', name: 'Copper Flare Fitting Set', quantity: 1, unit_price: 18.50, total_price: 18.50 });
  }
  if (lower.includes('condenser filter')) {
    materials.push({ part_id: 'FLT-COND-01', name: 'Condenser Filter 600x300mm', quantity: 6, unit_price: 28.00, total_price: 168.00 });
  }

  return materials;
}
