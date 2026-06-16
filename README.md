# OutboundOS Landing Page

A single-page, dark-exec B2B outbound sales landing page that auto-rebrands
per domain. Hosted on **Cloudflare Pages** with one project serving
**47+ domains** (apex + www) — dynamic brand name per hostname, automatic
apex→www redirects, GitHub auto-deploy.

- **`index.html`** — the landing page
- **`branding.js`** — dynamic per-domain branding (logo + year + meta)
- **`functions/_middleware.js`** — Pages Function that does apex→www 301 redirect
- **`Cloudflare_Hosting_Skill.md`** — **📖 full guide** on how this is hosted
  on Cloudflare, including how to deploy on new domains
- **`SPEC.md`** — design spec
- **`test_page.js`** — Playwright/smoke test
- **`.github/workflows/deploy.yml`** — GitHub Actions auto-deploy to Pages

---

## 🌐 Live URLs

- **Project URL**: https://outboundos.pages.dev
- **Per-domain**: https://www.<yourdomain> (and apex → www via 301)

Examples (all live):
- `https://www.moescale.site` → "MoeScale"
- `https://www.aioutbound.shop` → "AI Outbound"
- `https://www.salespartner.shop` → "Sales Partner"
- `https://www.unlawyered.io` → "Unlawyered"
- ... and 43 more

---

## 🏃 Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

For testing the dynamic branding locally with a specific hostname:
```bash
# macOS/Linux — edit /etc/hosts to add:  127.0.0.1  test.moescale.site
python3 -m http.server 8000
# open http://test.moescale.site:8000 — should show "MoeScale" brand
```

---

## 🎨 Branding

See `branding.js` → `BRAND_MAP` for the per-domain override table.
Anything not in the map auto-derives from the hostname.

To add a new brand for a new domain:
```js
// branding.js
var BRAND_MAP = {
  // ...existing entries...
  'yournewdomain.com': { name: 'Your Brand', tagline: 'Your tagline here' },
};
```

---

## 🚀 How to deploy this sales funnel on a NEW domain on Cloudflare

Want to put this on a new domain? Follow this 4-step recipe. Full details in
[`Cloudflare_Hosting_Skill.md`](./Cloudflare_Hosting_Skill.md).

### Prerequisites
- Domain added to Cloudflare (nameservers pointing at CF)
- A Cloudflare API token with **Pages: Edit** + **DNS: Edit** perms
- The `outboundos` Pages project already created (see Hosting Skill for that)

### Step 1 — Add `www.<domain>` DNS record
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"www","content":"outboundos.pages.dev","proxied":true,"ttl":1}'
```

### Step 2 — Add apex CNAME (replace any existing A record)
```bash
# Delete the existing apex A record (e.g. if it points to a mail server)
A_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id // empty')
[ -n "$A_ID" ] && curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$A_ID" \
  -H "Authorization: Bearer $CF_TOKEN"

# Add the apex CNAME
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"@","content":"outboundos.pages.dev","proxied":true,"ttl":1}'
```

> **Note on mail:** if you have mail on this domain, the MX record points to
> `mail.<domain>` (separate subdomain with its own A record). Mail keeps
> working when you replace the apex A record with a CNAME.

### Step 3 — Register both `www.<domain>` and `<domain>` in the Pages project
```bash
ACCT="your-cloudflare-account-id"
for name in "www.$DOMAIN" "$DOMAIN"; do
  curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/outboundos/domains" \
    -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\"}"
done
```

### Step 4 — Wait 10 minutes for the Google SSL cert
```bash
# Monitor
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null \
  | openssl x509 -noout -issuer
# Wait for: issuer=C = US, O = Google Trust Services

# Test
curl -I https://$DOMAIN/
# Expect: HTTP/2 301  location: https://www.$DOMAIN/
```

**Total time: 30 seconds of API calls + 10 minutes of patience.**

### Step 5 — Add the brand to BRAND_MAP (optional)
If you want a custom brand name for this domain (not auto-derived):
```js
// branding.js → BRAND_MAP
'yournewdomain.com': { name: 'Your Brand', tagline: 'Your tagline' },
```

Push to `main` — auto-deploys in ~30s. Done! 🚀

---

## 🐛 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Apex returns `521` or `522` | A record at apex, not CNAME | Replace apex A with CNAME→outboundos.pages.dev |
| SSL cert is Let's Encrypt, not Google | CNAME not at apex | Add the apex CNAME, wait 10 min |
| Pages custom domain stuck "pending" | API quirk | Delete + re-add the Pages custom domain in dashboard |
| `curl: (35) SSL handshake failure` | Cert mid-rotation | Wait 5-10 more min, retest |
| Apex returns `000` (timeout) | Pages hasn't routed the domain yet | Wait 10-15 min for full provisioning |

For deep troubleshooting, see
[`Cloudflare_Hosting_Skill.md`](./Cloudflare_Hosting_Skill.md#-troubleshooting).

---

## 🔗 Related

- **[`Cloudflare_Hosting_Skill.md`](./Cloudflare_Hosting_Skill.md)** —
  📖 **START HERE for the full hosting guide**, the CNAME-at-apex trick,
  why the cert rotation works, the bulk deploy script, and how to add
  the 48th domain.
- [`SPEC.md`](./SPEC.md) — design spec for the page itself
- [`branding.js`](./branding.js) — per-domain brand logic
- [`functions/_middleware.js`](./functions/_middleware.js) — the apex→www redirect function
