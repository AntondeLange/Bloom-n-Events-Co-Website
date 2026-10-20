# Website maintenance review — 20 October 2026

## Baseline and scope

Local checkout, fetched `origin/main`, and Vercel's production deployment all identified commit `57f9463ce469285eb6cb75ce31593128fb78174a`. GitHub reported no open PRs before implementation. Branch: `codex/website-maintenance-2026-10`. No repository AGENTS.md files were found. No merge, production release, domain, protection, billing, or retention configuration change was made.

The existing Vercel project is `prj_uNNdfOLAnASc3Lx3vkp53uOY9Z2H` in `team_zEkHfvxHWKBOUSdHNxugblpE`. Node is 22.x. Vercel authentication protects deployments except custom domains (`all_except_custom_domains`). The live deployment inspected was `dpl_7KEFe9XcfZyjDngbiJB31PjtHWgT`.

## Resulting behaviour

- `/api/contact` and `/api/lead` share one bounded validator, distributed Upstash limiter (five requests per minute per address) and Postmark delivery implementation. JSON and native URL-encoded contact submissions carry the same company, source, actual honeypot, brief and optional event details. Chat briefs use the same contract and a distinct subject. Reply-To uses the validated email.
- Request streams are bounded at 32 KiB, even without Content-Length. Names, email, phone, optional fields, transcript and 5,000-character briefs have explicit limits. Malformed values and header injection are rejected. Missing spam protection fails closed. Provider HTTP and JSON application status must both confirm acceptance; failures never report delivery.
- Hydrated forms validate inline, focus the first invalid field in document order, keep values after failure and synchronously lock in-flight submissions. Native failures return an escaped editable form with `no-store`; personal data is never placed in a redirect, browser storage, analytics or logs. Native successes use the existing `/contact-success` URL.
- Removed marketing checkbox: no working subscription list, consent ledger, wording/version record or subscription-provider integration was found. Historical SMTP code only included opt-in in an email. No subscription is created or represented as complete.
- Optional date/timeframe, location and indicative budget live in a collapsed form section. Privacy links appear beside enquiry collection and chat. No automatic customer acknowledgement email is sent by the unified handler.
- Chat uses visualViewport resize/scroll information, navigation height, safe areas and a scrollable message region. Controls stay outside message scrolling; short viewports omit suggestion chips. Text is charcoal on cream, input is 16px, controls have 44px minimum heights, Escape closes chat and returns focus. Failed chat messages remain available in the input.
- Mobile reading order is introduction/direct contact → form → location/social information. Navigation is height-bounded and scrollable, with Escape, outside-pointer and focus-leave dismissal. Gallery lightboxes support previous/next navigation and restore focus/scroll state. Reduced-motion overrides cover transitions and existing carousels already disable autoplay.
- Removed the homepage blocking loader from the layout, eliminating its inline SVG and artificial 4.4s + 0.4s delay. Existing hero/logo imagery and responsive image generation remain. Existing video already defers loading and respects reduced-motion/data-saving preferences. Shared scripts were reviewed: accordion/lightbox serve site-wide interactions, analytics is conditional on configuration/consent, and navigation/chat hydration supplies interactive behaviour.
- Unversioned `/assets/` and `/scripts/` now revalidate; fingerprinted `/_astro/` stays immutable. The retired service worker clears legacy caches and unregisters without forcing open tabs to reload and discard enquiries; it has no fetch interception or new registration.
- Analytics uses a validated configured ID, no Google request before acceptance, remembered refusal, a preferences control and event/parameter allowlists. Removed phone/email link text from events; page location/referrer exclude queries. CSP adds only the required Google script host and regional analytics collector, and removes unused browser OpenAI/formsubmit connections. Current CSP's existing inline-script allowance is preserved, not widened further.

## Dependency and runtime migration

| Dependency | Before (lockfile) | After |
| --- | --- | --- |
| Astro | 5.16.15 | 7.4.1 |
| @astrojs/vercel | 9.0.4 | 11.0.16 |
| @astrojs/react | 4.4.2 | 7.1.0 |
| Tailwind / @tailwindcss/vite | 4.1.18 | 4.3.3 |
| React / react-dom | 19.2.3 | 19.3.1 |
| Vite (Astro tree) | 6.4.1 | 8.3.4 |
| Sharp (root / Astro) | 0.33.5 / 0.34.5 | 0.35.5 / 0.35.5 |
| Node project setting | 22.x | 22.x (unchanged) |
| Node validation runtime | initial host 24.19.0 | 22.23.3 |
| Node engines / local file / CI | no engines / no local pin / CI 20 | >=22.22 <23 / .nvmrc 22 / CI 22 |

Verify the before-version table against `versions.json`, extracted directly from committed lockfiles. Root and Astro remain separate installations: root owns media-build dependencies, Astro owns the application. Removed unused root Vite/PostCSS/PurgeCSS/Stylelint tooling and duplicate root SMTP/Redis dependencies, plus unused Astro Nodemailer. The separate legacy backend is outside the Vercel build and was not upgraded.

Followed official [Astro 6](https://docs.astro.build/en/guides/upgrade-to/v6/) and [Astro 7](https://docs.astro.build/en/guides/upgrade-to/v7/) migration guidance. V6: Node minimum, Vite, integration changes; no legacy content collections, Astro.glob, custom adapter or removed APIs were in use. V7: Vite 8, stricter Rust compiler and whitespace changes; fixed an extra events FAQ closing div. Retained existing explicit compressHTML configuration. No experimental flags or prereleases. Tailwind/plugin are upgraded together within v4; no v3 migration is required. Reviewed the [Tailwind guide](https://tailwindcss.com/docs/upgrade-guide), [Vite migration](https://vite.dev/guide/migration), [Vercel Node guidance](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and [changelog](https://vercel.com/changelog).

The old global path-to-regexp override was replaced by a single override scoped to `@vercel/routing-utils`: 6.1.0 → patched 6.3.0 within the same major. The current Vercel adapter's routing utility still pins 6.1.0. This fixes [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j); no broad overrides, force fixes or adapter downgrade. The adapter builds and existing redirects are preserved with this patch.

## Security applicability

Audit counts are dependency findings, not evidence of exploitation. Before: root 25 findings (22 high, 3 moderate); Astro 29 (2 critical, 20 high, 6 moderate, 1 low). After: zero in each active tree. See checked-in audit summaries.

- [Astro AVIF/Sharp RCE](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2): installed Astro was affected by version. No upload endpoint, remote image allowlist or untrusted AVIF ingestion was found. Root image generation scans repository JPG/JPEG/PNG files. Existing generated AVIFs are served, not accepted from users. No working exploit path was demonstrated. Upgraded Astro and both Sharp copies remove the vulnerable native dependency versions.
- [JSX/MDX dynamic script/style injection](https://github.com/withastro/astro/security/advisories/GHSA-98hj-9722-w3j8): no MDX integration, user-authored JSX/MDX or untrusted script/style rendering was found. React islands render messages as text; structured-data scripts use repository-controlled data. Upgrade includes current fixes.
- [Vercel path override](https://github.com/withastro/astro/security/advisories/GHSA-mr6q-rp88-fx84): old adapter flagged; no ISR or authenticated content routes configured. Three API flows are public. Exposure is configuration-dependent; no exploit claim. Upgraded adapter removes flagged version.
- React Server Components advisories require RSC packages/protocol. This is Astro with SSR/hydrated React islands; no react-server-dom-* dependency or server actions were found. React and react-dom nevertheless upgraded together.
- Vite dev-server file-read/deny-bypass issues concern development servers; production serves compiled output/functions. Development was local only. Root unused Vite removed, Astro's Vite upgraded. Other Astro SSRF, transition and spread-attribute findings were reviewed against local-only images, absent view transitions/server islands and repository-controlled markup; upgrading also addresses dependency-level findings.
- Logs no longer include OpenAI error response bodies. Legacy `/api/chat%202` and `/api/chat%203` aliases retain their URLs while sharing the current bounded handler instead of divergent old implementations.

## Configuration and business confirmations still required

1. Delivery needs `POSTMARK_SERVER_TOKEN`, verified `LEAD_FROM_EMAIL`, `LEAD_TO_EMAIL`, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in the intended environment. The connector refused environment-variable metadata (403), and CLI credentials were invalid. Presence and production recipient configuration were not verified. No credentials were read or changed. Mocked delivery is verified; real mailbox delivery is unverified. Use a dedicated preview recipient before any approved delivery exercise.
2. Configure an existing authorised `PUBLIC_GA_MEASUREMENT_ID` (G-…) if none is set. Production HTML supplied an empty ID at baseline. No ID was invented. Verify GA property settings, including disabling enhanced automatic form/outbound data collection that could bypass the site's allowlists, then use consented DebugView/Realtime with synthetic data. No real GA property delivery is claimed.
3. `OPENAI_API_KEY` / optional `OPENAI_CHAT_MODEL` control the existing AI chat branch. Confirm approved provider/data handling and avoid entering sensitive information. Live AI calls were not exercised; browser flow and failure handling use mocks.
4. Confirm whose experience is counted and the calculation date before restoring a numeric total. Replaced 40+/120-year claims with non-quantified wording in relevant pages/metadata; brand positioning remains.
5. Confirm Neighbourhood Nibbles' project-specific number of centres/days and actual attendance. Five-centre copy conflicted with a seven-asset testimonial; non-quantified project wording avoids choosing one, and the client quotation is unchanged. The 100-child capacity is labelled as planning, not an achieved result. Several broader outcome statements remain qualitative and need client evidence before asserting quantified commercial uplift.
6. Blog's latest existing featured date remains 24 February 2026. Supply approved recent material, genuine publication dates and project links before publishing new entries; cards currently link to service/case-study routes, not individual articles.
7. Business/legal review: confirm engineering qualifications, sign-off responsibilities, WHS training/assessment evidence, insurance certificate, limits/exclusions, supplier insurance requirements, and broad compliance assertions. No certificates were present in the inspected repository. Policies replace blanket insurance guarantees with a request to discuss applicable cover; retained engineering/WHS/compliance claims elsewhere require owner confirmation. Confirm provider agreements, processing locations, access/deletion process and actual retention policy before approving the privacy text. No retention duration or legal compliance assurance has been invented.
8. Vercel denied rollback-candidate listing (403). Current production is READY, but older deployment retention/candidacy was not verifiable. Confirm dashboard retention and an accessible rollback deployment before release. No retention setting was changed and no deployments were deleted.

## Production release and rollback checklist (not executed)

- Review PR diff, passing CI, screenshots and dependency/advisory notes; obtain content/privacy confirmation for outstanding claims.
- Verify Node 22 minor meets >=22.22, preview remains protected, production branch/domains unchanged, delivery/Redis/AI configuration, and the authorised analytics ID/property settings.
- With separate authorisation, test delivery to a controlled preview mailbox and consented analytics against the authorised property; test a real iPhone/Safari keyboard and landscape experience.
- Record current production deployment ID and confirm it remains an eligible accessible rollback candidate under the project's retention policy. Keep its Git SHA and build configuration.
- Only after separate release approval, merge via normal review and release through the existing project. Verify routes, headers, metadata, sitemap/robots, one controlled enquiry and privacy/consent behaviour.
- On material regression, use the confirmed prior production deployment through Vercel's rollback UI/CLI; verify domains and enquiry behaviour. Vercel rollback can stop automatic domain assignment to future deployments until promotion restores it. Do not delete the prior deployment or change billing/retention to perform this review.

## Repeatable validation

Run `nvm use`, `npm ci`, `npm --prefix astro ci`, `npm run build`, `npm run check`, `npm run lint`, `npm test`, `npm run links:check`, `npm run seo:check`, `npm run assets:check`, both npm audits, then `cd astro && npx playwright install chromium && npm run test:browser`. ESLint now runs real recommended TypeScript rules on the maintained form/chat/menu/lightbox/carousel/server files; it does not claim to lint every legacy Astro template or CSS declaration. Astro check covers templates and TypeScript throughout the application. PR CI installs reproducibly and runs those checks against a local production-artifact server with mocked Postmark/Redis, without deployment or external secrets. The existing main-only deployment workflow's illegal job-level secrets condition was moved to its deployment step using environment bindings; its main-only production behaviour is preserved and was not executed here.

The browser harness is deliberately confined to the test directory and localhost, and never uses live email/Redis credentials. It exercises browser → shared enquiry handler → mocked Postmark → native/JSON response. Tests cover delivery failures without clearing fields, source/company payload, duplicate submission locks, 320/375/390/430 CSS pixel widths, 844×390 landscape, 768×1024 tablet and 1440×1000 desktop on all seven requested journey routes. Analytics acceptance/refusal/privacy use an explicitly fictional test ID and intercept Google's script; no real property receives events. Accessibility scans target changed form/chat interactions. A visualViewport event test simulates viewport contraction; it does not reproduce actual iOS keyboard/browser behaviour.

Screenshots are of the original and changed local production builds, using Chromium at 390×844 and 1440×1000 with empty enquiry fields. They show homepage, contact ordering and chat contrast/layout. No physical iPhone, Safari or VoiceOver testing was performed.

## Measurements and screenshots

Three fresh Chromium contexts per build; 390×844 viewport, 4× CPU slowdown, 40ms network latency, 10Mbps download/5Mbps upload, six-second observation window. Original and changed builds served locally on ports 4322/4323, browser cache isolated, third-party requests blocked consistently. See `performance.json` and `measure.mjs`; the measurement helper expects both local static builds and writes temporary results to `/tmp/bloom-maintenance`. These are local lab observations, not production field data or Lighthouse scores. Dynamic hero video is not a fixed frame in screenshots.

| Measurement (median of 3) | Original | Changed |
| --- | ---: | ---: |
| Uncompressed homepage HTML | 785,402 bytes | 79,430 bytes |
| Browser LCP | 888ms | 640ms |
| Browser first contentful paint | 404ms | 544ms |
| CLS in observation window | 0.00564 | 0.00564 |
| Artificial loader blocking | 4.4s + 0.4s exit | Removed |

HTML is 89.9% smaller. LCP improved in this local comparison; first paint was 140ms later and is reported rather than hidden. The original overlay could paint quickly while still covering the site for several seconds: paint timings alone do not describe its usability. No image quality settings were reduced for this pass.

| View | Original mobile | Changed mobile | Original desktop | Changed desktop |
| --- | --- | --- | --- | --- |
| Homepage | [Before](screenshots/before-home-mobile.png) | [After](screenshots/after-home-mobile.png) | [Before](screenshots/before-home-desktop.png) | [After](screenshots/after-home-desktop.png) |
| Contact | [Before](screenshots/before-contact-mobile.png) | [After](screenshots/after-contact-mobile.png) | [Before](screenshots/before-contact-desktop.png) | [After](screenshots/after-contact-desktop.png) |
| Chat | [Before](screenshots/before-chat-mobile.png) | [After](screenshots/after-chat-mobile.png) | [Before](screenshots/before-chat-desktop.png) | [After](screenshots/after-chat-desktop.png) |

## Recorded local results

- Clean `npm ci` in both packages and production build under Node 22.23.3: passed. Vercel function output declares `nodejs22.x`.
- Astro check: 73 files, zero errors, zero warnings, three informational hints (including the unused legacy duplicate chat component's deprecated React event type).
- ESLint recommended rules on maintained TypeScript files: passed.
- Node regression suite: 25 passed, zero failed.
- Chromium browser suite: 14 passed, zero failed (15.4s); covers seven routes at seven viewport sizes plus the specific interaction journeys described above.
- Axe: no serious/critical violations in the changed contact-form/chat scope; this is not a site-wide accessibility certification.
- Local-link and canonical checks: passed. Asset parser: 6,070 local references, zero missing assets. Each journey page has one h1, no horizontal overflow at tested widths, and returns HTTP 200 in the local build. Existing robots and sitemap public route set preserved; sitemap dates follow edited source files.
- Both active npm audits: zero findings after upgrades. `git diff --check`: passed.
- Real mailbox delivery, real Google Analytics property receipt, production API mutation and physical iPhone/Safari testing: not performed.


## Protected preview and remote CI

[Pull request #5](https://github.com/AntondeLange/Bloom-n-Events-Co-Website/pull/5) and [protected preview](https://bloom-n-events-co-website-4kbejhovs-antons-projects-978e1a78.vercel.app/).

Vercel's existing Git integration created READY deployment `dpl_4YNnKsPvHQyynaabjn1Y3N8az3oU` for the maintenance branch. The initial API request with `target: preview` was rejected by the API schema; the Git integration independently provided the requested preview without changing project settings. No replacement project or production deployment was created. The recorded deployment contains the tested implementation; a final evidence/author-attribution update triggers the same branch's normal preview/CI checks.

Unauthenticated preview access redirects to authentication (302). Authenticated connector GET checks confirmed 200 for `/`, `/contact`, `/scripts/analytics.js`, `/assets/images/butterfly-icon.svg`, `/sw.js`, `/robots.txt`, `/sitemap.xml` and a fingerprinted `/_astro/` stylesheet. Verified revalidation on scripts/assets, no-store on sw.js, one-year immutable caching on fingerprinted CSS, the updated CSP and preview noindex header. Contact HTML includes the shared endpoint/privacy link, excludes the marketing checkbox, and still has an empty analytics ID. These remote checks do not send enquiries or exercise live providers. Project SSO protection and production domains were re-read and remain unchanged.

[Initial PR CI run](https://github.com/AntondeLange/Bloom-n-Events-Co-Website/actions/runs/39407521297) passed on GitHub's Linux runner, including both clean installs, type/lint/unit/audit checks, production build, link/SEO/asset checks and all Chromium journeys. This supplements local macOS testing.

GitHub initially reported signature verification `no_user` because the checkout uses a placeholder example.com author email. The maintenance commit was re-attributed using the authenticated account's public GitHub noreply identity and the already-configured, already-registered Codex signing key; no account signing keys or repository rules were changed. Verify the current PR head's signature and final CI before merging.


Automated PR review identified that dynamic `import.meta.env[key]` could miss credentials supplied only through Astro/Vite .env files. The endpoint now references each required environment variable statically, with explicit process.env fallbacks for deployed Functions. This was corrected before handoff; no credential values were accessed or changed.
