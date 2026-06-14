# Crafts Platform — Backend

This folder contains the backend API. Frontend assets will live in sibling `/frontend`.

Quick start:

```bash
cd server
npm install
npm run dev
```

Swagger UI (after server starts): http://localhost:4000/api/docs

Environment variables (see .env.example):
- `MONGO_URI` — MongoDB connection string
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — SMTP mail sender
- `SENDGRID_API_KEY` — optional if using SendGrid SMTP relay

Email features:
- Verification email is sent automatically after registration.
- A welcome email is sent automatically after the user verifies their email.
- Admins can broadcast news updates to all verified users.

Email setup steps:
1. Copy `.env.example` to `.env`.
2. Configure SMTP values for a real mail provider or local testing tool:
   - `SMTP_HOST` e.g. `smtp.sendgrid.net` or `localhost`
   - `SMTP_PORT` e.g. `587` for TLS or `1025` for MailHog
   - `SMTP_SECURE` `true` for port 465, `false` for 587/1025
   - `SMTP_USER` / `SMTP_PASS` credentials
   - `SMTP_FROM` sender address like `Crafts Platform <no-reply@crafts.local>`
3. If using SendGrid SMTP relay, set `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, and `SMTP_PASS` to your SendGrid API key.
4. Start the backend with `npm run dev`.
5. Register a user via `POST /api/auth/register` and verify their email from the received link.
6. If the user forgets their password, request a reset link with `POST /api/auth/forgot-password`.
7. When the user clicks the reset link, they can set a new password using `POST /api/auth/reset-password`.

Development email testing:
- Use MailHog, Mailtrap, or a local SMTP server.
- If `SMTP_HOST` is not configured, the verification email content is printed in the server logs instead of being sent.

Admin newsletter endpoint:
- `POST /api/admin/newsletter` — send a news update to all verified users
  - body: `{ "subject": "News title", "message": "Your update text here." }`

Admin endpoints (protected):
- `GET /api/admin/users` — list users
- `PATCH /api/admin/users/:id/role` — assign role (body { role })
- `POST /api/admin/users/:id/revoke-refresh` — revoke refresh token (body { jti } or empty to revoke all)
