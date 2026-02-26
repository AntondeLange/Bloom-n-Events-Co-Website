# Bloom'n Events Co - Ultimate Sales Playbook

## 1. Purpose and Scope
This playbook is Bloom'n's commercial operating system for qualification, pricing, proposal execution, objection handling, and predictable project outcomes. It is a living operational document used in day-to-day sales execution.

## 2. Positioning and Core Value Proposition
Bloom'n is an integrated event production partner covering creative design, engineering rigor, fabrication, digital integration, and delivery under one accountable team. Commercial conversations should sell impact, confidence, and execution reliability, not commodity pricing.

## 3. Ideal Customer and Buyer Personas
- Corporate Marketers: brand elevation, campaign impact, ROI.
- Product and Experiential Leads: engagement, audience experience, measurable participation.
- Event Managers and Producers: reliability, compliance, production coordination.

Each persona should be maintained with budget ranges, procurement cycles, and decision criteria.

## 4. Sales Process and Stage Definitions
- Lead Intake and Qualify
- Deep Discovery
- Proposal and Live Presentation
- Commercial Negotiation
- Decision and Contract
- Handoff to Delivery

Every stage requires explicit exit criteria before progression.

## 5. Qualification and Scoring Framework
Score each category from 0-3:
- Budget
- Timing and Lead Time
- Decision Authority
- Scope Clarity
- Complexity and Operational Load
- Fit with Bloom Capabilities

Bands:
- 16-18: Priority Closed-Loop Deals
- 12-15: Qualified with Conditions
- 11 or below: Nurture or Disqualify

Track qualitative red flags:
- Unrealistic timelines
- Unclear decision authority
- Budget/complexity mismatch
- Ambiguous success metrics
- Capability mismatch

## 6. Pricing Heuristics and Commercial Principles
- Use value-led pricing, not simple cost-plus.
- Build pricing around outcomes and execution confidence.
- Add premiums for short lead times, compliance burden, and technical complexity.
- Include contingency for high coordination and multi-vendor risk.
- Keep pricing commitments conditional on scope clarity.

## 7. Tactical Plays
- First Outreach Play by persona
- Qualification Play using SPICED/MEDDICC-style questioning
- Live Proposal Play with all key stakeholders present
- Re-engagement Play for stalled deals
- Multi-stakeholder alignment play with owners and deadlines

Each play should define trigger, owner, and success condition.

## 8. Competitive Battlecards
Primary battlecards:
- Low-cost rental houses
- Agencies splitting design from delivery
- DIY and venue-only options

Differentiate on one-team accountability, engineering safety, bespoke execution, and measurable ROI potential.

## 9. Objection Handling
- "Too expensive": reframe to outcome value and risk mitigation, then right-size scope.
- "We only need basics": clarify desired outcome before narrowing scope.
- "We have internal teams": position Bloom as amplifier and risk reducer.

## 10. Post-Proposal and Mutual Action Plans
Every qualified proposal should include a MAP:
- tasks
- owners
- deadlines
- decision milestones

## 11. KPI and Performance Standards
Sales KPIs:
- Lead-to-proposal conversion
- Win rate
- Sales cycle length
- Revenue by complexity tier

Client outcomes:
- Engagement metrics
- Attendance and participation lift
- Sponsor satisfaction
- Post-event feedback quality

## 12. Continuous Improvement
Run quarterly updates from:
- Win/loss analysis
- Stakeholder feedback
- Market and competitor changes

Enable ongoing training through role-play, call review, and scenario workshops.

## Implementation Notes (Current Codebase)
This playbook is operationalized in:
- `astro/src/pages/api/chat.js`:
  - stage detection
  - 6-factor qualification scoring (0-18)
  - red flag generation
  - objection signal handling
  - MAP-style action outputs
- `astro/src/components/react/ChatConcierge.tsx`:
  - guided flows and lead-mode progression
  - lead capture routing to `/api/lead`
