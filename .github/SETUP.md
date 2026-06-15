# Auto-deploy setup

This repo auto-deploys to Cloudflare Pages on every push to `main`.

To enable it, add these two secrets at
**https://github.com/mamghar001/outboundos/settings/secrets/actions**:

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The same Cloudflare API token Mavis uses (admin scope on Pages) |
| `CLOUDFLARE_ACCOUNT_ID` | `77db3e5a281f2347593f5cabb1f2eaab` |

After saving, every `git push` to `main` triggers a fresh deploy to
https://outboundos.pages.dev (and any custom domain you wire up).

To add custom domains (e.g. moescale-landing → this project), tell Mavis the
domain and Cloudflare zone ID — she can add it via the API.

## Manual deploy (no GitHub Action)

```bash
CLOUDFLARE_API_TOKEN=*** CLOUDFLARE_ACCOUNT_ID=*** \
  wrangler pages deploy . --project-name=outboundos
```
