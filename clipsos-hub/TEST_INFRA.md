# E2E Test Infra: Schedule Dashboard Live Upgrades

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|---|
| 1 | Live Mode & Sync (F1) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Sidebar Selection (F2) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Safe Boundaries (F3) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 4 | Responsive Drawer (F4) | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |

## Test Architecture
- **Test Runner**: A programmatic Node.js test script (`verify-calendar.js` or similar) that uses Playwright/Puppeteer/jsdom/Supabase Client to simulate actions.
- **Verification mechanism**: Verification check queries against Supabase tables and virtual viewport rendering checks in `clipsos-hub`.
- **Directory layout**: Test files located in `clipsos-hub/src/tests/` or executed via mock test runners.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|---|---|---|
| 1 | Owner logs in, connects own Calendly, syncs events, verifies own events render. | F1 | Medium |
| 2 | Manager views calendar, searches for "Mohammed", selects him, views his synced calls. | F2 | Medium |
| 3 | Owner views unconnected Closer calendar, verifies "Not connected" warning appears, and settings/sync are hidden. | F3 | Medium |
| 4 | Manager switches to mobile resolution, verifies sidebar collapses to drawer/toggle, opens drawer, selects Closer. | F4 | High |
| 5 | Creator connects Calendly, syncs events, verifies creator schedule page loads and displays correct representative mapping. | F1, F3 | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total: 20)
- Tier 2: ≥5 per feature (Total: 20)
- Tier 3: Pairwise coverage of major feature interactions (Total: 4)
- Tier 4: ≥5 realistic application scenarios (Total: 5)
- **Total Minimum: 49 test cases**
