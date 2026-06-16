# Cloudflare Hosting Skill — Multi-Domain Landing Page Deployment

> How to host a single dynamic-branding landing page on 47+ domains using
> **Cloudflare Pages + GitHub + a Pages Function**, with apex→www redirects
> that just work — no DNS dance, no manual cert management, no API limits.

Built and battle-tested on the OutboundOS project (47 mail-configured domains
across `.shop`, `.site`, `.online`, `.xyz`, `.io`, `.com`, `.org` TLDs).

---

## 🎯 What this skill does

You give it:
- 1 HTML landing page (`index.html`)
- 1 JS file for dynamic branding (`branding.js`)
- A list of domains you want it served on

It gives you back:
- ✅ Page served on every domain's apex (`example.com`) AND `www.example.com`
- ✅ Apex auto-redirects to `www.` (301 permanent, SEO-friendly)
- ✅ Per-domain brand name auto-derived from hostname (with manual override map)
- ✅ Live year auto-updated in footer
- ✅ GitHub → auto-deploy pipeline
- ✅ Free Cloudflare Universal SSL (Google Trust Services cert, not LE)
- ✅ Mail keeps working (MX records untouched, on `mail.<domain>` subdomain)
- ✅ ~30 seconds to add a new domain

---

## 🏗️ Architecture

```
┌──────────────┐     git push      ┌────────────────┐
│   GitHub     │ ─────────────────▶│ Cloudflare     │
│   repo       │  GitHub Action    │ Pages project  │
│              │  (cloudflare/     │ (outboundos)   │
│  index.html  │   pages-action)   │                │
│  branding.js │                   │ Static assets  │
│  functions/  │                   │ + _middleware  │
└──────────────┘                   └────────┬───────┘
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                          www.<domain>           <domain>  (apex)
                          (CNAME→pages.dev)      (CNAME→pages.dev)
                          → 200 OK               → 301 → www.<domain>
                                                   (via _middleware.js)
```

**Why CNAME at the apex works:** Cloudflare supports **CNAME flattening** at the
zone apex. Even when you have MX/TXT records at the same name, Cloudflare
flattens the CNAME into an A record pointing to the same target as the CNAME.

---

## 🧩 Required files

```
.
├── index.html              # the landing page (with <span class="js-brand">OutboundOS</span>)
├── branding.js             # per-domain brand name + year overrides
├── functions/
│   └── _middleware.js      # apex→www redirect
├── _headers                # optional: cache, security headers
├── _redirects              # optional: path-level redirects
├── SPEC.md                 # design spec
├── README.md               # repo README
└── Cloudflare_Hosting_Skill.md  # ← you are here
```

### `functions/_middleware.js` (the secret sauce)

```js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname;
  // apex → www
  if (!host.startsWith('www.')) {
    const newUrl = new URL(context.request.url);
    newUrl.hostname = 'www.' + host;
    newUrl.protocol = 'https:';
    return Response.redirect(newUrl.toString(), 301);
  }
  return context.next();
}
```

This runs on **every** request to the Pages project. If the hostname doesn't
start with `www.`, it does a 301 redirect to the `www.` version. Otherwise
the request passes through to your static `index.html`.

### `branding.js` skeleton

```js
var BRAND_MAP = {
  'moescale.site':  { name: 'MoeScale',  tagline: 'Outbound that scales' },
  'aioutbound.shop':{ name: 'AI Outbound', tagline: 'AI agents that book meetings' },
  // ... one entry per domain
};

function getBrand() {
  var host = location.hostname.replace(/^www\./, '').toLowerCase();
  if (BRAND_MAP[host]) return BRAND_MAP[host];
  // fallback: derive from hostname
  return { name: titleCase(host.split('.')[0]), tagline: 'Default tagline' };
}

function applyBrand() {
  var brand = getBrand();
  document.querySelectorAll('.js-brand').forEach(function (el) {
    el.textContent = brand.name;
  });
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', applyBrand)
  : applyBrand();
```

In your `index.html`:
```html
<a class="logo">OutboundOS</a>           <!-- becomes <span class="js-brand">OutboundOS</span> -->
<p>© <span class="js-year">2026</span> <span class="js-brand">OutboundOS</span></p>
<script src="./branding.js"></script>
```

---

## 🚀 One-time setup (already done on this repo)

### 1. Cloudflare Pages project

```bash
# Install wrangler (or use the dashboard)
npm install -g wrangler

# Login
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
wrangler login

# Create the project (or via dashboard)
wrangler pages project create outboundos --production-branch=main
```

### 2. GitHub Actions auto-deploy

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: outboundos
          directory: .
```

Set secrets at: `https://github.com/<user>/<repo>/settings/secrets/actions`

### 3. Cloudflare API token (the painful part)

The token needs at least:
- **Account → Cloudflare Pages → Edit**
- **Zone → DNS → Edit**
- **Account → Account Rulesets → Edit** (or work around it — see "API limits" below)

You do NOT need: Bulk Redirects, Workers, Edge Certificates — all handled by
the Pages function.

---

## 📋 The recipe: add a new domain to the project

For each new domain, do these 4 steps (takes ~30 sec per domain, 10 min for
the cert to issue). Adapt the example to your domain.

### Step 1: Add the domain to Cloudflare (if not already)
- If not on Cloudflare: add the site, copy the nameservers, update at registrar.
- If already on Cloudflare: skip.

### Step 2: Add the `www.<domain>` CNAME
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"www","content":"outboundos.pages.dev","proxied":true,"ttl":1}'
```

### Step 3: Add the apex CNAME (the trick!)
```bash
# Delete any existing apex A record first (e.g. if it was pointing at a mail server)
A_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id')
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$A_ID" \
  -H "Authorization: Bearer $CF_TOKEN"

# Add the CNAME (Cloudflare will flatten it at the apex)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"@","content":"outboundos.pages.dev","proxied":true,"ttl":1}'
```

> **CRITICAL:** You MUST delete the existing apex A record (e.g. one pointing
> to a mail server). If you don't, you'll get DNS conflict errors when adding
> the CNAME. **But:** if the existing A record is for MAIL (which is on
> `mail.<domain>`, NOT the apex), you can still safely delete the apex A
> record — the mail keeps working because the MX record points to
> `mail.<domain>` which has its own A record.

### Step 4: Register both `www.<domain>` and `<domain>` in the Pages project
```bash
for name in "www.$DOMAIN" "$DOMAIN"; do
  curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/outboundos/domains" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\"}"
done
```

### Step 5: Wait ~10 minutes for the Google cert

Cloudflare will:
1. Issue a Google Trust Services cert for your domain (NOT Let's Encrypt)
2. Set up the SSL termination on its edge
3. Route traffic to your Pages project
4. The `_middleware.js` function handles the apex→www redirect

You can monitor with:
```bash
# Check SSL cert issuer
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null \
  | openssl x509 -noout -issuer
# Should show: issuer=C = US, O = Google Trust Services

# Test the redirect
curl -I https://$DOMAIN/
# Should show: HTTP/2 301  location: https://www.$DOMAIN/
```

---

## 🔥 Why this approach works (the 5 hard-won lessons)

### 1. CNAME-flatten at the apex
Cloudflare supports CNAME records at the zone apex (where standard DNS doesn't
allow them). It flattens them to A records internally. This is how Pages
custom domains work — they need a CNAME, not an A record.

### 2. Google cert vs Let's Encrypt — the silent killer
- Apex with **A record** (e.g. `192.0.2.1`) → Cloudflare serves a **Let's
  Encrypt** cert (Universal SSL default). This cert is **incompatible** with
  Pages custom domain routing. Result: 521/522 errors forever.
- Apex with **CNAME** → `outboundos.pages.dev` → Cloudflare issues a
  **Google Trust Services** cert within ~10 minutes. Pages routes correctly.
  Result: 200 OK on www, 301→www on apex.

**The transition trick:** if you already have an A record at the apex
(pointing at, say, a mail server), delete it and add the CNAME instead. Mail
keeps working because MX points to `mail.<domain>` (separate subdomain with
its own A record).

### 3. Mail setup is preserved
The mail server is at `mail.<domain>`, not `<domain>`. So:
- ✅ MX record at apex → `mail.<domain>` (untouched)
- ✅ `mail.<domain>` A record → mail server IP (untouched)
- ✅ Apex A record deleted (replaced with CNAME)
- ✅ DKIM, DMARC, SPF TXT records at apex (untouched)
- ✅ Outbound mail keeps working
- ✅ Inbound mail keeps working
- ✅ Web now serves the Pages project

### 4. The Pages function runs on EVERY request
Once the apex CNAME is in place, ALL requests to the apex (and www) reach the
Pages project, which runs `_middleware.js` first. The function inspects the
hostname and does the redirect. No DNS-level redirect needed.

### 5. Don't fight the API for SSL certs
Trying to force-rotate certs via the Cloudflare API (Universal SSL settings,
custom hostname SSL) is brittle and permission-gated. The CNAME approach is
self-healing: as long as the CNAME is correct, Cloudflare issues and renews
the cert automatically. Just wait 10 minutes.

---

## 🛑 The 3 landmines (and how to dodge)

### Landmine 1: "CNAME record not set" stuck status
Sometimes the Pages custom domain gets stuck in "pending" status with
`error_message: "CNAME record not set"` — even though the CNAME IS set.

**Fix:** Delete + re-add the apex A record (or CNAME). This usually
re-triggers the validation. If that doesn't work, remove the custom domain
entry in the Pages dashboard and re-add it via the UI.

### Landmine 2: "domain does not exist" / "already added" API loop
For domains with a history of failed attempts, the Pages API gets into a
state where:
- DELETE says "domain does not exist"
- POST says "you have already added this custom domain"

**Fix:** Manual dashboard intervention. Go to Workers & Pages → outboundos
project → Custom domains → find the stuck entry → remove it → re-add.

### Landmine 3: `uses_functions: true` blocks static-only optimizations
Adding `functions/_middleware.js` to the project enables Cloudflare Workers
on the project. This is fine for most cases, but slightly increases deploy
time and complexity. If you don't need the apex redirect, you can omit
`functions/` and serve static-only.

---

## 🎓 The bulk-deploy script (used to set up 47 domains)

```python
#!/usr/bin/env python3
import json, urllib.request, os
import concurrent.futures as cf

TOKEN = os.environ['CF_TOKEN']
ACCT  = "your-cloudflare-account-id"

def call(path, method="GET", body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4{path}",
        data=data, method=method,
        headers={"Authorization": f"Bearer {TOKEN}",
                 "Content-Type": "application/json"}
    )
    return json.loads(urllib.request.urlopen(req).read())

# Get all zones
zones = call("/zones?per_page=100")['result']

def add_domain(zone):
    name, zid = zone['name'], zone['id']
    # 1. www.<domain> CNAME
    call(f"/zones/{zid}/dns_records", "POST",
         {"type":"CNAME","name":f"www.{name}","content":"outboundos.pages.dev",
          "proxied":True,"ttl":1})
    # 2. delete existing apex A (if any)
    apex_a = call(f"/zones/{zid}/dns_records?type=A&name={name}")['result']
    for a in apex_a:
        call(f"/zones/{zid}/dns_records/{a['id']}", "DELETE")
    # 3. apex CNAME
    call(f"/zones/{zid}/dns_records", "POST",
         {"type":"CNAME","name":name,"content":"outboundos.pages.dev",
          "proxied":True,"ttl":1})
    # 4. register both in Pages
    for n in [f"www.{name}", name]:
        call(f"/accounts/{ACCT}/pages/projects/outboundos/domains", "POST",
             {"name": n})
    return name

with cf.ThreadPoolExecutor(max_workers=8) as ex:
    list(ex.map(add_domain, zones))

print("done — wait 10-15 min for certs to issue, then test all domains")
```

---

## 🆘 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `curl https://<domain>/` → `curl: (35) SSL handshake failure` | Wrong cert (Let's Encrypt instead of Google) | Check cert issuer; force CNAME at apex, wait 10 min |
| `curl https://<domain>/` → `HTTP 521` | Cloudflare can't reach origin | Apex is A record, not CNAME. Replace A with CNAME→outboundos.pages.dev |
| `curl https://<domain>/` → `HTTP 522` | Connection timeout (usually mid-cert-rotation) | Wait 5-10 min for cert to fully deploy |
| `curl https://www.<domain>/` → `200` but `curl https://<domain>/` → `000` | Only `www.` custom domain registered | Also register the apex as a Pages custom domain |
| Apex returns `521` for 30+ min | Pages custom domain stuck "pending" | Delete + re-add the Pages custom domain entry |
| `CF API error: 81053` (record exists) | Trying to add CNAME over an A record | Delete the A record first |
| `CF API error: 81054` (CNAME exists) | Trying to add A over a CNAME | Delete the CNAME first |

---

## 📊 Cost & limits

- **Cloudflare Pages**: free tier = 500 builds/month, unlimited requests,
  100 custom domains per project
- **DNS queries**: free tier = unlimited
- **SSL certs**: free (Google Trust Services)
- **GitHub Actions**: free for public repos, 2000 min/month for private

For the 47-domain OutboundOS project: $0/month.

---

## 🔗 Related

- [README.md](./README.md) — repo overview
- [SPEC.md](./SPEC.md) — design spec
- [branding.js](./branding.js) — per-domain brand logic
- [functions/_middleware.js](./functions/_middleware.js) — apex→www redirect
- Cloudflare docs: [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- Cloudflare docs: [CNAME flattening](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-cname-record/)
