# Design QA — single-mesh relief pass

final result: passed

## Compared states

- Reference: v14 desktop 1440×900 and mobile 390×844 captures.
- Implementation: `desktop-relief-final.png`, `desktop-relief-angle.png`, and `mobile-relief-final.png`.
- Combined visual input: `relief-qa-comparison.jpg`.

## Findings

- P0: none.
- P1: none. The scroll rods and unfurl prop animation are removed; the flower is no longer rendered as offset translucent copies.
- P2: none. One continuous WebGL mesh preserves the complete painting while depth displacement, view rotation, and directional relief lighting create spatial response. Desktop and mobile remain within the viewport with no horizontal overflow.
- P3: the mobile poem deliberately remains over the lower painting, matching the established editorial composition; a future content-focused iteration could increase its local paper wash for readability.

## Runtime checks

- TypeScript: passed.
- Production build: passed (existing large-chunk advisory only).
- Automated tests: 6/6 passed.
- Browser console errors: none on desktop or mobile.
- Responsive check: 390×844 passed; no horizontal overflow.
