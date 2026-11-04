# Cloud visual polish

Independent base: feature/cloud-world-final @ b24647c3b998b1d48d65ed1f69e87c337252f514. Branch feature/cloud-world-polish; draft PR targets feature/cloud-world-final, never the GWO branch.

Before: docs/evidence/cloud-final-vms.png and cloud-final-queue.png. After: docs/evidence/cloud-polish-vms.png, cloud-polish-queue.png, cloud-polish-allocation.png, cloud-polish-overview.png and cloud-polish-kiosk.png. Original car/camera, same day/year and viewport; scenery timing/weather is live rather than pixel-identical.

Changes:
- Rounded, layered server family with front ventilation, in-body capacity/load displays, accent trims, one/two/three cooling stacks and pulsing destination activity lamps. M3 brick geometry/material retained as a low foundation. Receiving bays use rounded platforms and color-coded guide rails.
- Eight handled, beveled computational packages replace strapped cubes. Task ID and workload have two-line high-contrast labels on the moving body. Four-by-two staggered dispatch formation replaces the crowded single row.
- Roadside identity replaces the windscreen-spanning gate board. Compact task dispatch marker and roofed research kiosk replace oversized explanation boards. Makespan belongs to that kiosk. Source MI values, MIPS capacities and external load/makespan semantics unchanged.
- Label texture aspect ratios match two-line panels, and label-only drop/core shadows are disabled through the existing Bruno material API to prevent shadow acne. Environment/actors continue to use original shading/lighting. No renderer, camera or input changes.
- Existing allocationTarget destinations, public APIs and zone/spawn/exit/research coordinates preserved. LabelOffset follows each task during animation and reset. One cached interpolation vector replaces per-tick task vector allocations. No repeated-event mesh/listener creation.

Validation: npm test 5/5 PASS; production build PASS; independent Chrome smoke 13/13 PASS including main/cloud transitions, actual keyboard driving/R/E/Enter/Esc, eight tasks/three VMs, exact M4 Round Robin destinations and loads (11.833333333333334,8.1,2.2), completed motion, stable Cloud actor count, schedule snapshot and reset. No new JS page/local HTTP errors. Browser screenshots inspected after label correction. Native car camera is used, with test setup moving the car to several stopping positions.

Existing font/bundle warnings remain. No sustained FPS, WebGL/mobile or production-browser claim. Long arbitrary load text and extreme approach angles still need integrator review. Dynamic task actors and receiving pads remain visual installations rather than rigid bodies; VM core colliders, safe spawn and native terrain remain. Main gate approach test chooses an M2-validated nearby footprint within the trigger to avoid original movable props.
