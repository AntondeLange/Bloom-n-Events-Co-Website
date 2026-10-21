# Restore SMTP2GO enquiry delivery

The shared contact/chat handler expected Postmark, while the existing Vercel project has SMTP2GO credentials. This repair sends through SMTP2GO using Nodemailer, preserving the shared validation, honeypot, source attribution, company/event fields, validated Reply-To, native form retry flow and fail-closed distributed rate limiting.

## Configuration

| Setting | Purpose |
| --- | --- |
| `SMTP_USER`, `SMTP_PASS` | Existing private SMTP2GO credentials. |
| `SMTP_HOST` | Optional; defaults to `mail-au.smtp2go.com`. |
| `SMTP_PORT` | Optional; defaults to `2525` with mandatory STARTTLS. Ports 465, 8465 and 443 use implicit TLS. Certificate verification remains enabled. |
| `LEAD_FROM_EMAIL` or existing `CONTACT_FROM_EMAIL` | Sender authorised by SMTP2GO. Existing sender is retained. |
| `LEAD_TO_EMAIL` or existing `CONTACT_TO_EMAIL` | Destination. Set `LEAD_TO_EMAIL=enquiry@bloomneventsco.com.au` in the release environment. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiter; Marketplace `KV_REST_API_URL`, `KV_REST_API_TOKEN` aliases are also accepted. |

Postmark configuration is no longer needed for the maintained `/api/lead` and `/api/contact` endpoints. Historical duplicate source files are outside this repair.

The limiter permits five requests per minute per network address across both maintained endpoints. A missing/unavailable limiter returns 503; exhausted limits return 429. This protection is not replaced with an unreliable per-instance counter. The Redis integration must be connected before release.

SMTP errors/rejections return a failure and preserve entered details. Success requires recipient acceptance and a final SMTP 250 response. This establishes provider acceptance, not inbox delivery. No automatic SMTP retry is attempted because retrying an uncertain result can duplicate an enquiry. SMTP protocol debugging and content logging are disabled.

## Validation

- Node 22.23.3 local checks; Vercel project remains Node 22.x.
- 29 unit tests pass, including SMTP refusal, rejected/missing/unexpected recipient, missing configuration, network error, one-attempt behaviour, encrypted transport and exact requested recipient.
- ESLint passes. Astro check reports zero errors/warnings and three existing deprecation hints.
- Production build succeeds. Nodemailer 10.1.7 dependency audit reports zero vulnerabilities.
- Real TLS connection and SMTP authentication using the existing preview credentials pass; this does not send a message or prove sender verification/inbox delivery.
- All 14 Chromium browser regressions pass using mock SMTP delivery. Protected deployment verification is recorded in the pull request.
- The free `bloom-enquiry-rate-limit` Upstash Redis resource is provisioned in Sydney and connected to Preview/Development, with automatic paid upgrades disabled. Production connection still requires release approval.
- Upstash SDK timeout responses are explicitly rejected even when they contain `success: true`; an integration regression verifies a 503 response without delivery.

## Release

1. Complete the Upstash terms step in the existing Vercel team, create a free Redis resource with automatic paid upgrades disabled, and connect it to the required environment. Verify distributed limiting using a honeypot request that cannot send mail.
2. Confirm `LEAD_TO_EMAIL` is the requested destination, existing SMTP credentials and authorised sender are present, and Redis REST settings are available in Production.
3. Review/merge this PR and release only with the user's approval. The initial maintenance request explicitly reserves merge and Production changes for approval.
4. With separate explicit permission, send a clearly marked test enquiry and confirm receipt in the intended mailbox. No production-recipient test messages have been sent during this repair.
5. If reverting, use a known tested deployment; the previous Postmark-based revision has missing provider configuration and is not a functioning mail-delivery fallback.

References: [SMTP2GO Node.js setup](https://www.smtp2go.com/setupguide/node-js-script/), [Nodemailer SMTP](https://nodemailer.com/smtp), [Upstash Vercel integration](https://upstash.com/docs/redis/howto/vercelintegration).
