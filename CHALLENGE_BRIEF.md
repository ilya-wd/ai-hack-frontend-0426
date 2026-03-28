# Challenge: Field Service Work Reporting Agent

## Background

A field service company sends technicians to customer sites to perform maintenance and repairs -- HVAC systems, plumbing, electrical work, industrial refrigeration. After each job, the technician needs to report what they did, what materials they used, and how long it took. This report becomes an invoice line item sent to the customer.

Today this process is manual and error-prone. Technicians forget to list materials, bill the wrong rate, report work outside their contract scope, or duplicate work that was already done. Your job is to fix this.

## The Challenge

Build an interface that leverages an AI agent/agents in the background that acts as a work reporting assistant for field service technicians. The interface should:

1. Accept natural language input from a technician describing what they did or are about to do
2. Identify the customer, site, and service category from the conversation
3. Validate the reported work against the customer's contract (covered services, pricing, special conditions)
4. Ask follow-up questions when information is missing or ambiguous -- do not guess
5. Suggest materials that were likely used but not reported, based on the type of work and historical records
6. Check that the worker holds any required certifications for the reported work -- **before they start** if possible
7. Reference work history to detect potential duplicates and prevent unnecessary work
8. Produce a structured work log entry for every interaction, with a nested invoice line item when the work is billable

The agent's user is a field technician typing on a phone between jobs. Expect informal, incomplete, sometimes messy input.

**Important**: Not all work is billable. The agent should always produce a work log entry, but only include an invoice line item when the work is covered by the contract and there are no blocking compliance issues. When work isn't billable, the work log should explain why.

## Input Context

Each message from a technician comes with two pieces of context that your agent receives automatically:

- **`worker_id`** -- identifies who the technician is (e.g. `W-001`). The worker is on their own device, so the system knows who they are. Your agent should use this to look up the worker's name, certifications, and customer assignments from `workers.json`.
- **`date`** -- today's date. The agent knows what day it is without asking. If the worker says they did work on a different day, use that date instead.

Your agent should not ask the worker for their name or today's date -- this information is already available.

## Source Data

You are provided with the following JSON files. Your agent should use these as its knowledge base.

| File | Description |
|------|-------------|
| `contracts.json` | 3 customers with full contract details: sites, service categories, pricing tiers, special conditions, SLA terms |
| `workers.json` | 4 technicians with their certifications, skills, and customer assignments |
| `work_history.json` | 13 historical work records showing past jobs, materials used, and outcomes |
| `parts_catalog.json` | Materials catalog with prices and work-type associations (which parts are typically used for which jobs) |
| `work_queue.json` | 8 upcoming scheduled jobs (used for the bonus work direction feature) |
| `example_conversations.json` | 5 mock dialogues showing expected agent behavior and conversation flow |
| `work_log_schema.json` | The primary output schema -- wraps invoice items, handles non-billable work. Includes examples. |
| `invoice_item_schema.json` | Schema for the nested invoice line item (when work is billable), with a worked example |
| `test_prompts.json` | 10 test scenarios for validating your agent (see Testing section below) |

Read these files carefully before you start building. The contracts in particular contain important edge cases.

## Worked Example

Here is one complete interaction to illustrate the expected flow.

**Technician input:**
> Hi, Janne here. I replaced 3 LED tube lights in the hallway at Greenfield Sports Hall today. Took about an hour. No other materials needed.

**What the agent should do:**
1. Worker is Janne Korhonen (W-002) -- known from session context (`worker_id` provided)
2. Match "Greenfield Sports Hall" to site GFS-S3 under customer GFS-001
3. Categorize as "Minor Electrical" from the GFS contract
4. Use today's date (worker didn't specify otherwise)
5. Look up LED tube lights in the parts catalog -> FIX-LED-02 (LED Tube T8, 8.50 EUR each)
6. Check: total will be under 500 EUR limit -- no approval needed
7. No certification required for light replacement
8. Produce a work log entry with a nested invoice line item

**Agent response (example -- your personality may differ):**
> Janne, got it. Just to confirm:
>
> **Greenfield Sports Hall -- Minor Electrical**
> - Replaced 3x LED tube lights (T8 1200mm) in hallway
> - 1 hour today
> - 3x LED Tube T8 from stock
>
> Anything else, or should I log this?

Note: the agent confirms the work details with the worker but does **not** show pricing. The pricing is calculated internally in the work log output.

**Structured output (work log entry):**
```json
{
  "customer_id": "GFS-001",
  "contract_id": "GFS-2025-SM01",
  "site_id": "GFS-S3",
  "worker_id": "W-002",
  "date": "2026-03-20",
  "service_category": "Minor Electrical",
  "work_type": "repair",
  "description": "Replaced 3 LED tube lights in hallway.",
  "hours_worked": 1.0,
  "materials": [
    { "part_id": "FIX-LED-02", "name": "LED Tube T8 1200mm 18W", "quantity": 3, "unit_price": 8.50, "total_price": 25.50 }
  ],
  "status": "complete",
  "billable": true,
  "billability_reasoning": "Standard repair within contract scope, within cost limits, performed during business hours.",
  "compliance_flags": [],
  "invoice_item": {
    "customer_id": "GFS-001",
    "contract_id": "GFS-2025-SM01",
    "site_id": "GFS-S3",
    "worker_id": "W-002",
    "date": "2026-03-20",
    "service_category": "Minor Electrical",
    "work_type": "repair",
    "description": "Replaced 3 LED tube lights in hallway.",
    "hours_worked": 1.0,
    "rate_type": "normal",
    "hourly_rate": 62.00,
    "labor_cost": 62.00,
    "materials": [
      { "part_id": "FIX-LED-02", "name": "LED Tube T8 1200mm 18W", "quantity": 3, "unit_price": 8.50, "total_price": 25.50 }
    ],
    "materials_cost": 28.05,
    "material_markup_percentage": 10,
    "travel_cost": 0,
    "total_cost": 90.05,
    "requires_approval": false,
    "certification_verified": null,
    "validation_notes": []
  }
}
```

## Key Things Your Agent Should Catch

These are the kinds of issues your agent should detect and handle:

- **Missing materials**: What if a worker reports a repair but forgets to mention some of the materials they used? The parts catalog has associations between work types and commonly used parts. Your agent should use those to suggest what might be missing.
- **Certification requirements**: What happens when a worker is about to do something they're not qualified for? Some work requires specific certifications -- check the contracts. Your agent should catch this **before** the work starts and suggest an alternative. If uncertified work was already done, it shouldn't be billed normally -- flag it for management review.
- **Contract scope**: What if the reported work isn't covered by the customer's contract, or was done outside the contract's service hours? Not all contracts cover evenings or weekends.
- **Cost limits**: What if a job is going to cost more than the contract allows without prior approval? Your agent should catch this before the worker commits to the work.
- **Duplicate work**: What if someone is about to do work that the history shows was already completed this period? Your agent should prevent wasted effort.
- **Rate selection**: Different rates apply at different times. How does your agent know which hourly rate to apply based on the context?
- **Non-catalog materials**: What if the worker used a part that isn't in the catalog? Each contract has its own rules for non-catalog materials -- check the pricing section.

## Output Schema: Work Log Entry

Your agent's primary output is a **work log entry** (see `work_log_schema.json`). Every interaction produces a work log -- it's the record of what happened or what was planned.

A work log entry has a **status**:
- `complete` -- work done and logged
- `prevented` -- agent stopped the worker before they started (e.g. duplicate work, certification issue)
- `pending_approval` -- work requires approval before billing (e.g. exceeds cost limit)
- `pending_review` -- compliance issue needs management attention

When work is **billable**, the work log contains a nested `invoice_item` conforming to `invoice_item_schema.json`. When work is **not billable**, `invoice_item` is null and `billability_reasoning` explains why.

Key fields in the work log:
- Customer, contract, site, and worker identifiers
- Description, hours, and materials
- `billable` -- whether this should be invoiced
- `billability_reasoning` -- always populated, explains the billing decision
- `compliance_flags` -- any certification, scope, or policy issues
- `invoice_item` -- the full invoice line item (when billable), or null

Key fields in the invoice item (when present):
- Rate type and hourly rate (from contract pricing)
- Material cost with the correct contract markup applied
- Travel cost (if applicable)
- Total cost calculation
- `requires_approval` flag with reason
- `certification_verified` flag
- `validation_notes` for any warnings

### When work is NOT billable

The agent should set `billable: false` and `invoice_item: null` when:
- Work falls outside the contract's covered services (excluded work)
- Work duplicates something already completed this period
- A compliance issue blocks billing (e.g. uncertified worker performed restricted work)
- The agent prevented the worker from starting (duplicate, certification issue)

In these cases, the `billability_reasoning` field should clearly explain why no invoice was created, and `compliance_flags` should capture any issues for management.

### Non-catalog materials

Workers sometimes source parts directly from suppliers. Each contract has its own policy for non-catalog materials -- check the `non_catalog_materials` section in the contract pricing. The rules vary:
- Some contracts auto-approve non-catalog items under a certain cost
- Some require approval for all non-catalog materials
- The contract's standard material markup always applies
- The agent should ask for the supplier price if the worker doesn't provide it

## Agent Interface

Your agent must be testable. Choose one of the following interfaces, in order of preference:

**Option 1 -- Conversation log file (minimum requirement)**

Run your agent through test scenarios and save the results as a JSON file per scenario:

```json
{
  "scenario": "description of what was tested",
  "worker_id": "W-001",
  "date": "2026-03-20",
  "messages": [
    { "role": "worker", "content": "fixed a leaking pipe at herttoniemi warehouse..." },
    { "role": "agent", "content": "Got it, Pekka. A few questions..." },
    { "role": "worker", "content": "..." },
    { "role": "agent", "content": "..." }
  ],
  "work_log": { ... }
}
```

The `worker_id` identifies the technician (from `workers.json`). Your agent should know who the worker is from the start -- they're using their own device. The `date` is the current date -- the agent knows what day it is without asking. If the worker says they did work on a different day, use that instead. The `work_log` field should contain the final structured output conforming to `work_log_schema.json`.

**Option 2 -- Interactive UI (bonus points)**

If your agent has a UI (web, mobile, CLI), we will test it live during judging. A visual UI earns bonus points under the scoring criteria.

## Scoring

### Core Functionality (60%)

| Criterion | What we look for |
|-----------|-----------------|
| Identification | Correctly resolves worker, customer, site, and service category from natural language |
| Contract validation | Applies correct rates, detects excluded work, respects service hours and cost limits |
| Material suggestions | Suggests likely missing materials using catalog associations and work history |
| Certification checks | Catches certification violations when the contract requires them |
| History awareness | Detects duplicates, prevents unnecessary work, references past work for context |
| Output accuracy | Correct work log status, correct billability reasoning, correct invoice math when billable |
| Information gathering | Asks for what's missing, doesn't guess or hallucinate |

### Conversation Quality (20%)

| Criterion | What we look for |
|-----------|-----------------|
| Efficiency | Groups related questions, doesn't over-ask |
| Messy input handling | Handles typos, abbreviations, incomplete sentences |
| Personality | Appropriate tone for field technicians -- helpful and direct, not corporate or robotic |
| Groundedness | Sticks to provided data, flags ambiguity rather than making assumptions |

### Bonus Features (20%)

| Feature | Description |
|---------|-------------|
| Visual UI | Any interface beyond CLI. Mobile-friendly layout scores higher. |
| Voice | Speech-to-text input and/or text-to-speech output |
| Work direction | Worker asks "what's next?" -- agent pulls from work queue, describes the job, lists parts they'll likely need |
| Hour/budget tracking | Tracks cumulative hours against NPS monthly allowance or GFS annual budget |
| Manager view | A second persona (manager role) can query work logs: "what has Pekka done this week?", "any compliance violations to review?", "has the scheduled maintenance been done?" |

## Tips

- Start by reading all the source data files. The contracts especially have important nuances -- pay attention to pricing, non-catalog material policies, and excluded work.
- Get a basic conversational loop working first, then add validation features incrementally.
- The `worker_id` is always provided as session context. Your agent knows who the worker is from the start -- use that to look up their certifications and assignments.
- The parts catalog `work_type_associations` are your best friend for material suggestions.
- The `work_history.json` records show patterns -- what materials were used for similar jobs in the past.
- Don't try to hardcode every rule. The contracts are structured data -- let your agent reason over them.
- Field workers type on phones. "fixed pipe at herttoniemi. 2hrs" is a realistic input.
- The work log is your primary output, not the invoice. Always produce a work log -- even when work isn't billable.
- Your agent should prevent problems, not just catch them after the fact. If a worker is about to do something they shouldn't, warn them first.
- Personality matters. Your agent is talking to technicians between jobs -- be helpful and direct, not corporate or robotic.

## Testing Your Agent

`test_prompts.json` contains 10 test scenarios at varying difficulty levels (easy, medium, hard). Use these to validate your agent during development.

Each test case has:

| Field | Description |
|-------|-------------|
| `worker_id` | Pass this as session context when starting the conversation |
| `initial_message` | The first thing the worker says -- send this as the opening message |
| `situation` | What actually happened -- use this as ground truth when the agent asks follow-up questions |
| `follow_up_hints` | Specific answers for questions the agent might ask (e.g. which materials, whether approval was obtained) |

**How to use them:**

1. Start a new conversation with the test case's `worker_id` and today's date (`2026-03-25`) as session context
2. Send the `initial_message` as the worker's first input
3. When the agent asks follow-up questions, answer based on the `situation` and `follow_up_hints`
4. Check that the agent produces a valid work log entry at the end

The test cases cover the core scenarios your agent should handle: clean reports, missing materials, certification blocks, cost limits, duplicates, out-of-hours work, vague input, and compound multi-task reports.

## Rules

- You may use any programming language, framework, or tools.
- You may use any LLM API available to you.
- Source data files must not be modified -- treat them as read-only external data.
- Your agent must work with the data as provided. Do not add fictional contracts, workers, or history.
- All team members should be able to explain how the agent works.

Good luck.
