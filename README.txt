NAIJA BRAIN ARENA — VERSION 2 (CLOUDFLARE WORKER + D1)

WHAT THIS VERSION INCLUDES
- Original responsive quiz website and six quiz categories.
- Public sponsor cards, managed promotional ad cards and affiliate offer cards.
- /admin.html dashboard to add, pause, activate and delete sponsors, promotional ads and affiliate links.
- Premium offer card manager (display only; no payment collection).
- Facebook sharing/post-text helper.
- Cloudflare Worker API with password login and signed, expiring admin sessions.
- Cloudflare D1 storage so approved changes can be shown to all visitors, not just one browser.
- No paid API and no external API key.

IMPORTANT HONEST LIMITATIONS
1. The "Ad placements" section manages your own sponsored/promotional cards. It is NOT Google AdSense and does not itself pay you.
2. To earn from Google AdSense or another ad network, apply and get approved, then add that network's official ad code/placement as directed by the provider. Never paste untrusted code.
3. Affiliate links earn only if you join a real affiliate programme and use its approved tracking URL; commissions depend on its rules and qualifying purchases.
4. Sponsorship revenue requires real sponsor agreements and payment.
5. Premium cards only advertise a plan. No payments or paid account access are implemented. Add a verified payment provider integration before charging users.
6. Facebook website shares do not automatically pay. Facebook content monetization has separate eligibility and programme rules.
7. This version does not implement global user accounts, global quiz leaderboard, or payment processing.

DEPLOYMENT (Cloudflare)
This is a Worker with static assets and a D1 database. It is not a Pages-only static upload.

A. Create the D1 database
- In Cloudflare dashboard, open Workers & Pages > D1.
- Create a database named: naija-brain-arena-db
- Open its Console and run the full contents of schema.sql.
- Copy the database ID.

B. Configure the project
- In wrangler.toml, replace PASTE_YOUR_D1_DATABASE_ID_HERE with your actual D1 database ID.
- Keep the binding name DB exactly as written.
- Upload/deploy the project using Wrangler or your GitHub-connected Cloudflare Worker workflow. Project root must contain worker.js, wrangler.toml, schema.sql and public/index.html + public/admin.html.
- If using Wrangler CLI: run `npx wrangler deploy` from the project root after dependencies/CLI setup.

C. Add secrets (never put passwords in wrangler.toml or public HTML)
Use the Cloudflare Worker Settings > Variables and Secrets page:
- Add secret named ADMIN_PASSWORD. Choose a long, unique password.
- Add secret named SESSION_SECRET. Use a different random secret with at least 32 characters.
Do not share these values or place them in public GitHub code.
If using Wrangler CLI:
- `npx wrangler secret put ADMIN_PASSWORD`
- `npx wrangler secret put SESSION_SECRET`

D. Open and test
- Open your deployed Worker URL.
- Visit / and confirm the quiz loads.
- Visit /admin.html and sign in with ADMIN_PASSWORD.
- Add a test sponsor/affiliate using a URL you control or trust.
- Open the homepage in a private/incognito tab to confirm active cards appear.
- Delete test entries before public promotion.

PHONE-FRIENDLY NOTE
You can manage content from your Android phone after deployment by visiting /admin.html. Initial Cloudflare D1 binding, secret setup and deployment may be easier through Cloudflare dashboard or GitHub. If you share a screenshot of the Cloudflare screen you are on, I can guide the exact next tap.

SECURITY
- Use a strong unique admin password and keep SESSION_SECRET private.
- The admin session expires after 8 hours and is stored in sessionStorage.
- Do not put payment card details or private customer data in this dashboard.
- Add privacy policy, terms, contact information and any legally required disclosures before public launch.
- Review all quiz questions and sponsor claims before publishing.

BEFORE LAUNCH
- Replace hello@naijabrainarena.com in the public homepage with an email address you control.
- Confirm all sponsor and affiliate links are authorised and accurate.
- Publish a privacy policy and terms.
- Test on mobile and desktop.

BUSINESS IDENTITY AND PUBLIC CONTACT (ADDED)
- Operator / company name displayed: Microsoft Service Engineering
- Email: toheba234@gmail.com
- Phone / WhatsApp: +234 802 476 4090
- GitHub: https://www.github.com/toheebay
- Public pages added: /about.html, /contact.html, /privacy.html, /terms.html, /disclosure.html
- Footer now links to these pages and provides email, telephone, WhatsApp and GitHub links.

IMPORTANT: The policy pages are starter templates, not legal advice. Confirm your actual hosting, analytics, cookies, advertising and data practices and get appropriate review before publishing. Only use the company name as a legal company name if it is registered as such; otherwise it can be presented as your business/operator name.
