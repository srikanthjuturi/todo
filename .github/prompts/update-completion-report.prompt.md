---
name: update-completion-report
description: "Analyze PRD/TRD plus api and web code, then update docs/completion-report.md with current completion status and gap analysis"
argument-hint: "Optional focus, such as backend only, frontend only, or verify a specific phase"
agent: agent
---
Update [docs/completion-report.md](../docs/completion-report.md) for this repository.

Task:
- Read all PRD files in the repository root or `docs/`.
- Read all TRD files in the repository root or `docs/`.
- Scan the full `api/` folder recursively.
- Scan the full `web/` folder recursively.
- Base all findings strictly on actual code and documents found in the workspace.

Required output:
- Refresh the markdown content in [docs/completion-report.md](../docs/completion-report.md).
- Preserve the existing report structure unless the repository requirements clearly changed.
- Recalculate completion percentages and counts.
- Re-evaluate backend completion, frontend completion, detailed gap analysis, and recommendations.
- Re-evaluate the cross-phase regression test carry-forward section.
- If the user supplied an argument, use it as an audit focus, but still update the full report.

Rules:
- Do not modify source files under `api/` or `web/`.
- Only write inside `docs/`.
- Be thorough and do not skip files or folders inside `api/` and `web/`.
- Mark each requirement as `Completed`, `Partially Implemented`, or `Not Started` based only on current code.
- Call out requirement mismatches between implementation and PRD/TRD explicitly.
- If tests exist beyond PRD/TRD wording, mention them where relevant, but do not treat undocumented tests as requirement completion unless they validate documented behavior.

Suggested process:
1. Extract every feature, module, endpoint, UI screen, and technical requirement from PRD/TRD.
2. Map backend implementation to those requirements.
3. Map frontend implementation to those requirements.
4. Recompute the gap analysis and overall completion summary.
5. Update the report file in place.

Expected tone:
- Precise, evidence-based, and audit-oriented.
- No assumptions beyond what is present in the repository.
