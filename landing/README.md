# Campus Landing

Static preview for the Campus founder launch. It uses the existing Campus logo
and local Google Sans Flex fonts from the native application.

The form collects a founder's name, WhatsApp number, degree program, and first
use case. It posts to the Campus relay and has a honeypot field. Configure the
following before publishing:

- `campus-founder-api` in `index.html` with the relay endpoint.
- A Cloudflare Turnstile site key in `index.html` and its secret in the relay.
- Founder admin credentials and a Resend notification address in the relay.
