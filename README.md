# OutboundOS Landing Page

A single-page, dark-exec B2B outbound sales landing page that auto-rebrands per domain.

- **`index.html`** — the landing page
- **`branding.js`** — dynamic per-domain branding (logo + year + meta)
- **`SPEC.md`** — design spec
- **`test_page.js`** — Playwright/smoke test
- **`.gitignore`** — node_modules, env, OS junk

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Connected to Cloudflare Pages — every push to `main` auto-deploys.
Production: https://outboundos.pages.dev (and any custom domain from BRAND_MAP).

## Branding

See `branding.js` → `BRAND_MAP` for the per-domain override table.
Anything not in the map auto-derives from the hostname.
