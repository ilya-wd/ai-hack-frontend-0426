# Field Service Web UI

React + TypeScript frontend for the field service work reporting agent. Runs standalone with a mock agent — no backend required during development.

**Dev server:** `npm run dev` → http://localhost:5173

---

## What It Does

A mobile-first web app where a field technician describes their work (by voice or text) and the UI auto-populates a structured work report form. Key sections appear dynamically as the agent extracts relevant data.

```
Technician speaks/types
        ↓
  MockAgentService           ← swap for HttpAgentService when connecting to Nanoclaw
        ↓
  AgentResponse
  ├── message          → shown in Chat Panel
  ├── fieldUpdates     → merged into form (Customer, Site, Hours, etc.)
  ├── sectionsToShow   → reveals Materials / Compliance / Approval sections
  └── clarification?   → shown as a banner above the voice button
```

---

## Project Structure

```
src/
├── types/
│   ├── index.ts          # Domain types: Worker, Material, ComplianceFlag, ChatMessage
│   ├── form.ts           # FormState, DynamicSections, initial values
│   └── agent.ts          # AgentService interface, AgentContext, AgentResponse
│
├── data/
│   ├── workers.json      # 4 technicians with certifications and assignments
│   ├── contracts.json    # 3 customers with sites and service categories
│   └── mockResponses.ts  # Keyword extraction + response generation logic
│
├── services/
│   └── mockAgent.ts      # MockAgentService (implements AgentService)
│
├── hooks/
│   ├── useVoiceInput.ts  # Web Speech API push-to-talk
│   ├── useWorkReport.ts  # Form state + dynamic section management
│   └── useChat.ts        # Conversation history
│
└── components/
    ├── WorkReportForm/   # Main form: core fields + dynamic sections
    │   ├── index.tsx
    │   ├── CustomerSiteSelector.tsx
    │   ├── ServiceCategorySelector.tsx
    │   ├── DynamicSection.tsx         # Visibility wrapper
    │   ├── MaterialsList.tsx          # Dynamic section
    │   ├── ComplianceFlags.tsx        # Dynamic section
    │   └── ClarificationBanner.tsx
    ├── ChatPanel/
    │   ├── index.tsx                  # Fullscreen overlay, toggled from header
    │   └── MessageBubble.tsx
    ├── VoiceButton.tsx                # Push-to-talk (idle → listening → processing)
    └── WorkerSelector.tsx             # Simulates logged-in worker identity
```

---

## Mock Data Workflow

In development the app uses `MockAgentService` instead of a real backend. The mock pipeline has two steps: **field extraction** and **response generation**.

### Step 1 — Field Extraction (`extractFieldUpdates`)

`src/data/mockResponses.ts` → `extractFieldUpdates(text, currentForm)`

Scans the input text with keyword checks and regexes, returns a `Partial<FormState>` that gets merged into the form.

| Input keywords | Field populated | Value set |
|---|---|---|
| `"greenfield"` | `customer_id` | `"GFS-001"` |
| `"greenfield" + "primary"` | `site_id` | `"GFS-S1"` |
| `"greenfield" + "secondary"` | `site_id` | `"GFS-S2"` |
| `"greenfield" + "sports"` | `site_id` | `"GFS-S3"` |
| `"frostbite"` | `customer_id` + `site_id` | `"FBL-001"` + `"FBL-S1"` |
| `"nordic"` / `"shopping center"` | `customer_id` + `site_id` | `"NPS-001"` + `"NPS-S1"` |
| `"toilet"` / `"pipe"` / `"valve"` | `service_category` | `"Minor Plumbing"` |
| `"hvac"` / `"heat pump"` | `service_category` | `"HVAC"` |
| `"electric"` / `"led"` | `service_category` | `"Minor Electrical"` |
| `"boiler"` / `"heating"` | `service_category` | `"Heating"` |
| `"refriger"` / `"cold storage"` | `service_category` | `"Refrigeration"` |
| `"2.5 hours"` / `"2hrs"` | `hours` | `"2.5"` |
| `"an hour and a half"` | `hours` | `"1.5"` |
| *(any text > 10 chars, first message)* | `description` | Raw transcript |

### Step 2 — Response Generation (`generateMockResponse`)

`src/data/mockResponses.ts` → `generateMockResponse(text, updates, currentForm)`

Based on the same text and the extracted updates, it decides:

- **What the agent says** — a confirmation summary or a clarification question
- **Which dynamic sections to reveal** (`sectionsToShow`)
- **What materials to pre-populate** via `buildMaterialsFromText`
- **Whether a clarification is needed** (e.g. missing customer/site)

| Speech pattern | Section revealed | Materials added |
|---|---|---|
| `"fill valve"` / `"toilet valve"` | Materials | Toilet Fill Valve Universal × 2 |
| `"flapper"` | Materials | Toilet Flapper Valve 2" × 2 |
| `"led tube"` / `"led light"` | Materials | LED Tube T8 1200mm × 3 |
| `"expansion valve"` | Materials | Thermal Expansion Valve 3/8" × 1 |
| `"refrigerant"` / `"r-410"` | Materials + Certification | Refrigerant R-410A × 1.5 kg |
| `"flare fitting"` | Materials | Copper Flare Fitting Set × 1 |
| `"condenser filter"` | Materials | Condenser Filter 600×300mm × 6 |
| `"refrigerant"` / `"r-449"` | Certification | Shows "Certification verified" badge |
| `"evening"` / `"6pm"` / `"after hours"` | Compliance | Flag: out-of-hours work |

**Clarification logic:** if no fields were extracted (empty `updates`), the response asks for what is missing — customer/site, type of work, or hours.

### Full data flow example

Input: *"Fixed two toilets at Greenfield Primary, hour and a half"*

```
extractFieldUpdates → {
  customer_id: "GFS-001",
  site_id: "GFS-S1",
  service_category: "Minor Plumbing",
  hours: "1.5",
  description: "Fixed two toilets at Greenfield Primary, hour and a half"
}

generateMockResponse → AgentResponse {
  message: "Got it. Here's what I have:\n\nCustomer: City of Greenfield...\nSite: Greenfield Primary...",
  fieldUpdates: { customer_id, site_id, service_category, hours, description },
  sectionsToShow: {},       ← no materials detected yet
  clarification: undefined  ← enough info, no question
}
```

Follow-up: *"I replaced the fill valves and flappers"*

```
extractFieldUpdates → {}   ← no new core fields

generateMockResponse → AgentResponse {
  message: "Got it. Here's what I have:\n\nMaterials: Toilet Fill Valve Universal, ...",
  fieldUpdates: { materials: [Fill Valve ×2, Flapper ×2] },
  sectionsToShow: { showMaterials: true },
  clarification: undefined
}
```

---

## Simulated Workers

Select from the header dropdown. Each worker has different certifications — in the real agent these determine contract access and compliance checks.

| ID | Name | Role | Certifications |
|---|---|---|---|
| W-001 | Pekka Virtanen | Senior Technician | Refrigerant Cat I, Electrical S2, Hot Work |
| W-002 | Janne Korhonen | Technician | Electrical S2 |
| W-003 | Lauri Heikkinen | Junior Technician | Occupational Safety only |
| W-004 | Sanna Makela | Technician | Refrigerant Cat II, Hot Work |

Switching worker resets the form, chat history, and agent state.

---

## Dynamic Sections

The form starts with only core fields visible. Sections appear when the mock agent detects relevant data and sets the corresponding flag in `DynamicSections`:

| Section | `DynamicSections` flag | Appears when |
|---|---|---|
| Materials list | `showMaterials` | Any material keyword detected |
| Compliance flags | `showCompliance` | Out-of-hours or other violations detected |
| Approval notes | `showApproval` | Compliance section is visible |
| Certification badge | `showCertification` | Refrigerant keyword detected |

Sections never hide again once shown — preventing accidental data loss mid-conversation.

---

## Voice Input

Uses the browser's built-in Web Speech API. No external service or API key required.

**Supported browsers:** Chrome, Edge, Safari. Firefox requires an experimental flag.

**Interaction:**
1. Hold the **🎤 Hold to speak** button
2. Speak your report naturally
3. Release — transcript is sent to the mock agent
4. Form fields populate from the response

**States:** `idle` (blue) → `listening` (red, pulsing dot) → `processing` (spinner)

If speech recognition is unavailable, the text input above the voice button provides a fallback.

---

## Submit Output

**Submit** opens an overlay with the structured JSON that would be sent to the Nanoclaw agent:

```json
{
  "worker_id": "W-002",
  "date": "2026-03-28",
  "customer_id": "GFS-001",
  "site_id": "GFS-S1",
  "service_category": "Minor Plumbing",
  "description": "Fixed two toilets at Greenfield Primary...",
  "hours_worked": 1.5,
  "materials": [
    { "part_id": "PLB-FILL-01", "name": "Toilet Fill Valve Universal", "quantity": 2, "unit_price": 15.50, "total_price": 31.00 }
  ],
  "compliance_flags": [],
  "certification_verified": null
}
```

This maps to `work_log_schema.json` from the challenge brief.

---

## Extending the Mock

### Add a new keyword → field mapping

Edit `extractFieldUpdates` in `src/data/mockResponses.ts`:

```typescript
// Detect a new site
if (lower.includes('herttoniemi') || lower.includes('warehouse')) {
  updates.customer_id = 'NPS-001';
  updates.site_id = 'NPS-S3';
}
```

### Add a new material keyword

Edit `buildMaterialsFromText` in `src/data/mockResponses.ts`:

```typescript
if (lower.includes('pipe insulation')) {
  materials.push({
    part_id: 'INS-PIPE-01',
    name: 'Pipe Insulation 22mm',
    quantity: 2,
    unit_price: 12.00,
    total_price: 24.00,
  });
}
```

### Add a new compliance trigger

Edit `generateMockResponse` in `src/data/mockResponses.ts`:

```typescript
const hasCostLimit = lower.includes('approval') || lower.includes('expensive');
if (hasCostLimit) {
  response.sectionsToShow.showCompliance = true;
  response.sectionsToShow.showApproval = true;
  response.fieldUpdates.compliance_flags = [{
    type: 'cost',
    severity: 'warning',
    description: 'Job may exceed the per-incident cost limit.',
    action_required: 'Get written approval before proceeding.',
  }];
}
```

---

## Connecting to Nanoclaw

When ready to replace the mock with the real agent:

**1.** Add an HTTP endpoint to Nanoclaw:

```typescript
// nanoclaw/src/channels/web-api.ts
app.post('/api/message', async (req, res) => {
  const { text, worker_id, date, form } = req.body;
  // route through existing agent pipeline
  res.json(agentResponse); // must match AgentResponse shape in src/types/agent.ts
});
```

**2.** Create `HttpAgentService` in `src/services/`:

```typescript
export class HttpAgentService implements AgentService {
  constructor(private baseUrl: string) {}

  async sendMessage(text: string, context: AgentContext, currentForm: FormState): Promise<AgentResponse> {
    const res = await fetch(`${this.baseUrl}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...context, form: currentForm }),
    });
    return res.json() as Promise<AgentResponse>;
  }

  reset() {}
}
```

**3.** Swap the singleton at the bottom of `src/services/mockAgent.ts`:

```typescript
// Development (current)
export const agentService: AgentService = new MockAgentService();

// Connected to Nanoclaw
// export const agentService: AgentService = new HttpAgentService('http://your-nanoclaw-host');
```

The `AgentResponse` the endpoint returns must include `message`, `fieldUpdates`, and `sectionsToShow` — the shape is defined in `src/types/agent.ts`.
