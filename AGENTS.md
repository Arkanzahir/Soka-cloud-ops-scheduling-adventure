# AGENTS.md — aturan singkat untuk coding agent

- First read `README.md`, `docs/PRD.md`, `docs/GDD.md`, `docs/ALGORITHM_SPEC.md`, `docs/PAPER_REVIEW.md`, `docs/WORLD_DESIGN_SPEC.md`, and `docs/IMPLEMENTATION_PLAN.md`.
- Work in milestones. Begin at M0 audit; do not start feature implementation before original project baseline passes.
- Preserve original Bruno game design, vehicle, camera, physics, terrain, materials, lighting, and asset pipeline wherever appropriate.
- Changes must be modular, testable, licensed/credited, and compatible with GitHub Pages static deployment.
- Build ACO/GWO numerical logic separately from renderer. Visualizations must reflect actual trace events.
- Do not mislabel standard ACO/GWO as paper-specific improved variants.
- Run and report real tests. No invented success, paper metadata, benchmark scores, or deployed links.
- Keep replies concise: files changed; tests run; screenshots; blockers; next milestone.

## Session rules (owner, 2026-11-04)

- Always apply `$caveman` for this project: concise output, full implementation and testing quality.
- Use one primary agent sequentially; no automatic parallel subagents. Delegate only a specific problem when necessary and demonstrably more efficient.
- Finish and test one milestone before the next. Commit verified milestone work.
- Read saved audit/handoff first; inspect only relevant source, never repeat the entire audit without a material change.
- Reuse Bruno assets/materials/systems. Prefer small edits; no design experiments without acceptance criteria.
- Run builds and automated tests; persist technical decisions and evidence. Never trade correctness or world quality for token savings.
