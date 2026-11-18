# Return Policy implementation — local review required

Prepared 16 October 2026. The user subsequently authorized GitHub publication. This implementation is being committed to `codex/return-policy-review` for review; main remains unchanged. No deployment was explicitly requested. Operational policy terms still require merchant approval before merging or PayHere submission.

## Repository verification

The requested workspace, `/Users/usmanfahim08/Documents/Antz Soft Heaven`, is on `master` at `7aaf8ba363b8eabbddb812f1b8ab40525268ccac` with extensive existing changes. Its footer and routes predate the deployed legal pages. It was not changed by this implementation.

The clean checkout `/Users/usmanfahim08/Documents/GitHub/softheaven` is on `main` at `df94814524d5d8cf1145eddd36882e3e97031e4d`. A network `git ls-remote` confirmed remote `main` at the same SHA. Its minimal footer and existing legal pages match the brief. The public `https://softheavenlk.vercel.app/returns-refunds` responded HTTP 200. The deployment's exact Git SHA was not independently verified.

Changes were prepared from an archive of that clean main in this isolated review directory. Neither original checkout was switched, reset, or edited. An apply-ready `return-policy.patch` is provided beside this directory (at `.codex-qa/return-policy.patch` in the original workspace). The isolated copy has no separate Git branch. Review and apply the patch to the verified canonical checkout when appropriate; do not copy the whole older reference workspace over it.

## Files

Created: `app/return-policy/page.tsx`, this report.

Modified: `app/returns-refunds/page.tsx`, `components/site-footer.tsx`, `components/policy-page.tsx`, `components/policy-page.css`, `lib/policies.tsx`, `app/checkout/page.tsx`, `next.config.mjs`.

Reused: existing return policy source in `lib/policies.tsx`, business configuration, policy page and TOC components, cloud background, Privacy, Terms, Shipping, checkout and footer. No dependencies added. Privacy content is unchanged. Terms and Shipping route files are unchanged; their shared source cross-links now target the canonical policy.

## Behavior

- `/return-policy` is the only return document; `/returns-refunds` permanently redirects there. Existing `#damaged`, `#cancellation`, `#returns`, `#request`, `#refunds`, `#charges` anchors remain available.
- Legal footer order: Privacy Policy, Return Policy, Terms & Conditions. Customer Care retains Shipping & Delivery. Existing footer CSS, columns, brand, divider and Back to Top preserved.
- Checkout's existing policy notice now names and links Return Policy; calculations, payment methods and submission behavior unchanged.
- Return page includes all 13 requested subject areas, a five-step request explanation, sticky desktop TOC, mobile grid, existing active-section handling, support CTA, reduced-motion CSS, focus styles and existing shared sky.
- Exact return-page title and description; canonical uses the existing configured production-domain mechanism. No new domain or noindex added. Anonymous direct rendering confirmed. The inherited storefront layout remains dynamic and database-dependent; this work does not alter that architecture.
- Existing neutral guidance is reorganized. No fixed return window, refund deadline, blanket hygiene exclusion, return address, exchange entitlement, cancellation deadline or shipping fee invented.

## Merchant decisions — approval required before publication

1. Return request period, its delivery/start event, and how requests within that period are recorded.
2. Eligible reasons, including whether change-of-mind returns are offered.
3. Approved conditions: use, tags, packaging, proof of purchase; exceptions for damaged or incorrect goods.
4. Remedies for damaged, defective, incomplete and incorrectly supplied orders; approval and rejection procedure.
5. Refund eligibility, inspection requirements, communication channel and escalation for disputed decisions.
6. Refund initiation target and provider-dependent settlement wording; no instant or universal gateway/partial refund promise.
7. Approved COD refund method and minimal securely collected information.
8. Exchange availability, conditions, stock handling and delivery charges.
9. Specific non-returnable items and lawful exceptions; no blanket plush-toy exclusion.
10. Cancellation availability before fulfilment and after dispatch; any actual deadline, fees and refund treatment.
11. Who pays return shipping in each scenario and whether original shipping is refundable.
12. Verified operational return destination, support contact channels and confirmation that support receives/responds to requests. Existing Contact form does not deliver messages; no verified public support channels appeared in the preview. This is a publication blocker.
13. Merchant approval of the complete final wording and effective date. The preview's 2026-10-16 date records this draft edit, not approval.

Configurable merchant fields remain in existing `lib/business.ts`: `returnEligibilityPeriod`, `returnEligibility`, `returnAddress`, `cancellationConditions`, `exchanges`, `nonReturnableItems`, `shippingRefunds`. Unconfirmed values stay null. No developer placeholders are displayed. A missing eligibility window/start event remains a material omission; neutral support guidance does not make this policy complete or approved.

## Validation

- TypeScript, ESLint, production Turbopack build: passed.
- Existing automated suite: 24/24 passed.
- Anonymous production-preview route checks and responsive browser evidence are recorded below.
- Original reference workspace typecheck fails on pre-existing duplicate `.next/types/* 3.ts` declarations; the clean isolated implementation passes. No original generated files were removed.
- Nested preview emits a workspace-root inference warning due to two lockfiles; no deployment configuration was changed to suppress a preview-only warning.
- No authenticated purchase, payment, refund, cancellation, data mutation or live deployment test performed.

## Readiness

Technical routing, footer links, checkout links, metadata and local build are ready for review. Merchant accuracy, effective operational support and legal/PayHere acceptance remain unresolved. Do not publish unapproved wording. PayHere approval is not guaranteed.

Browser checks: policy at 320, 375, 390, 430, 768, 1024, 1440 and 1920px showed document width equal to viewport width and no horizontally clipped H1/H2. Desktop TOC sticky; mobile TOC static. No browser console errors or warnings observed on the policy. Footer legal links appeared in the required order. Local anonymous Home, Shop, a published product, Cart, Checkout, Contact and all legal pages returned HTTP 200 without the global error content. Authenticated checkout submission was not exercised.

Final redirect verification: `/returns-refunds` returns HTTP 308 with Location `/return-policy`; browser navigation reached the canonical page. Patch passed `git apply --check` against the clean canonical main. Responsive TOC number wrapping corrected and production build passed again.

## GitHub publication follow-up

After the isolated checks, the patch was applied to the verified canonical checkout on `codex/return-policy-review`, at the user’s request to push to GitHub. The earlier isolation notes describe preparation, not the final checkout state. The original reference workspace remains untouched. No merchant policy decisions were approved by the request to push.
