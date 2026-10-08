# SoftHaven merchant review checklist

Implementation date: 8 October 2026. These pages are not approval from PayHere or legal advice. Merchant confirmation is required before publication/submission.

## Complete the public merchant configuration

Update `lib/business.ts`. Existing public admin settings supply the email, telephone, postal address and WhatsApp URL where configured. Confirm those settings are genuine merchant contacts.

Required confirmations:
- Registered business name; registration number if applicable.
- Business/postal address, support email, telephone, support hours and optional WhatsApp.
- Return request window, condition/packaging requirements and any justified hygiene restrictions.
- Return address, exchanges and genuine non-returnable categories (use “None” if applicable).
- Original delivery-charge and return-shipping refund rules, including faulty/incorrect items.
- Cancellation deadline and rules before fulfilment, during fulfilment and after dispatch.
- Delivery coverage, estimated delivery time, order-processing time, failed delivery/redelivery arrangements.
- Canonical website URL and approved policy update date.

Review policy wording with the merchant before replacing bracketed values. Do not invent a rule simply to clear a placeholder.

## Customer-facing implementation

- Existing About, Shop, Collections, product detail, Cart and Checkout routes retained.
- Privacy, Returns/Refunds, Shipping/Delivery and Terms pages added.
- Cancellation Policy is independently linked at `/returns-refunds#cancellation`.
- Contact page reuses public settings and displays merchant identity/contact details.
- Contact composer opens an email application only when a support email exists; it does not claim to send a message automatically.
- Footer links all policies and customer-care routes; copyright year is dynamic.
- Checkout links Terms, Privacy and Returns immediately before its final order button.
- Currency remains LKR; delivery fees and totals remain derived by existing checkout logic.

## Payment and release boundary

Only Cash on Delivery is currently enabled. PayHere online payment is not integrated by this task. Gateway credentials, callback verification and payment enablement require a separate authorized implementation. Never publish Merchant Secret or other private credentials.

Do not submit the incomplete merchant configuration for approval. Verify real contacts and policies, product/stock availability, destination-specific checkout quotes, and authenticated order completion in the production environment before merchant review. This implementation does not claim a live purchase or gateway refund was tested.

No automatic deployment is authorized for this task.
