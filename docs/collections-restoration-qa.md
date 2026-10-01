# Collections restoration verification

Restored from the page before commit 79c522a (parent c6e2a52): CollectionsDifference, SoftHavenForThat, and A Softer Experience copy, value statements, moment labels, story/shop destinations and one existing four-companion editorial image. The previous six-photo grid and repeated group/teddy photography were deliberately not restored. The new lower content presents the live getStorefront catalogue as text rows and adds a concluding shop CTA before the existing shared footer.

Approved hero preservation: its section markup and entire collections.module.css are byte-for-byte unchanged. At 1440×900, browser heading/card rectangles, font sizes and image sources exactly matched the recorded pre-restoration version. Hero campaign assets, CollectionsDiscoveryMotion, shared sky controller, navigation, footer, metadata and storefront data/services were not edited.

Verified on the local production build at localhost:3017 on 2026-10-01:

- Lint, standalone TypeScript check and optimized production build passed.
- Entire page scrolled at 1920×1080, 1600×900, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 430×932, 412×915, 390×844, 375×812 and 360×800. Each had zero horizontal overflow, no broken images or clipped restored headings/rows, six catalogue destinations, five lower sections and one global footer.
- Clicked all six restored collection links; each shop filter rendered its matching heading. Story CTA opened /about; concluding CTA opened /shop; Browse every collection returned to the catalogue index.
- Collection row hover moved the arrow 6px and activated its divider; keyboard navigation displayed a purple focus outline. Whole collection rows and CTAs provide touch targets above 44px.
- Alternating up/down scrolling maintained distinct right-to-left cloud depth speeds without overflow. After inertia settled, cloud transforms were identical in samples 1.1 seconds apart. Scrolled reload and route navigation away/back passed.
- No captured browser warnings or errors in exercised flows.
- Lower reveals use five section triggers and transform/opacity only. Content is visible in server HTML and initial states apply only on section entry. Reduced-motion handling was verified in source; browser media emulation was not performed.
- Only one additional photograph is rendered, with 1100px desktop / 640px mobile WebP variants, explicit dimensions and lazy loading. The existing image is reused, not regenerated.

Local full-page desktop/mobile proof and all viewport captures are under the chat visualization folder in collections-restoration/. QA screenshots are excluded from this release.
