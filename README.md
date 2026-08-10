# Krishna Portfolio

Single-file portfolio (`index.html`) plus self-hosted fonts under `fonts/`.

## Where this is actually hosted

**GitHub Pages**, serving `krishna03-glitch/krishna-portfolio` at the apex domain
`krishnasharma.xyz`. The `CNAME` file is what binds the custom domain — do not
delete or rename it, and keep it in the deploy root.

DNS is managed at Hostinger (nameservers `hyperion.dns-parking.com` /
`atlas.dns-parking.com`):

| Record | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `krishna03-glitch.github.io` |

The AAAA records are currently **missing**. Without them, IPv6-only clients
cannot reach the apex at all. Add them in the Hostinger DNS panel.

### Inert config kept for reference

`vercel.json` and `.htaccess` are **not read by GitHub Pages** and have no
effect on the live site. They describe the previous Vercel and Hostinger/Apache
deployments. Notably, GitHub Pages supports no custom headers, so the security
and caching headers those files set (HSTS, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, long-lived font caching) are **not**
being served today. Moving back to Vercel or Apache is the only way to restore
them.

## HTTPS runbook

Symptom: the browser shows a certificate error ("your connection is not
private") and the site appears completely down, even though the content is
served correctly over plain HTTP.

Cause: GitHub Pages has not issued a Let's Encrypt certificate for the custom
domain, so it falls back to presenting its default `*.github.io` certificate,
which does not match `krishnasharma.xyz`.

Fix, in order:

1. In **Settings → Pages**, confirm the custom domain reads `krishnasharma.xyz`
   and shows a green DNS check.
2. Wait for *"Certificate is being provisioned"* to clear. This usually takes
   minutes; GitHub allows up to 24 hours.
3. If it stays pending, **remove the custom domain, save, re-add it, and save
   again**. Provisioning does not automatically retry after a failed attempt —
   which is what happens when the domain is set in Pages *before* DNS has
   propagated to the GitHub IPs. Re-adding is the documented way to retrigger it.
4. Only once the certificate is issued, tick **Enforce HTTPS**.

Do not tick *Enforce HTTPS* while the certificate is still pending — it takes
the site from "works over HTTP" to "unreachable over both protocols."

### Why some visitors cannot bypass the warning

The site was previously served from Vercel with
`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
Any browser that loaded the site during that period cached a two-year HSTS pin,
so for those visitors HTTPS is mandatory and the certificate error has **no
click-through option**. They stay hard-blocked until the certificate is issued;
there is no server-side workaround, and clearing it individually requires
resetting the domain's HSTS state in the browser.

The domain is *not* on the HSTS preload list, so first-time visitors are still
served over HTTP normally.

### Old Vercel deployments

`krishna-portfolio-nine-rose.vercel.app` and
`krishna-portfolio-nine-rose-two.vercel.app` are still live and `308`-redirect
to `https://krishnasharma.xyz/`. While the certificate is broken they redirect
into the failure rather than acting as a fallback. Retire them once Pages is
healthy.

## Deploying

Push to `main`. GitHub Pages publishes from the branch root; there is no build
step. Verify with:

```sh
curl -sSI https://krishnasharma.xyz | head -1
```
