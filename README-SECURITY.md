# Security notes

Short version: this is a static site with no backend, no database, no login,
and no user data storage — so entire categories of vulnerability (SQL
injection, auth bypass, session hijacking, server-side RCE, XXE) simply don't
apply, because there's no server-side code to exploit. That's the strongest
security property a site can have: there's almost nothing there to attack.

What remains for a static site is: (1) don't let injected content run as
script, (2) don't leak the page into a frame you don't control, (3) don't
load third-party code you haven't reviewed, (4) serve it over HTTPS only.
Here's what's in place for each.

## What's already hardened

- **No inline JS.** All script logic lives in `script.js` / `404.js`, loaded
  with `<script src>`. Nothing runs from a `<script>` block, an `onclick=`
  attribute, `eval()`, or `new Function()`.
- **No inline CSS.** All styling lives in `styles.css` / `404.css` / `fonts.css`.
- **Content-Security-Policy**, set via `<meta http-equiv>` in both HTML
  files: only same-origin scripts, styles, fonts, and images may load —
  `script-src 'self'` with no `'unsafe-inline'`, no `'unsafe-eval'`. If
  someone ever injects a `<script src="https://evil.example/x.js">` into the
  page (e.g. via a compromised dependency you add later), the browser
  refuses to load it.
- **No third-party runtime dependencies.** Fonts are self-hosted (see the
  `fonts/` folder) instead of pulled from Google's CDN at every page load —
  removes both a tracking vector and a supply-chain dependency. There is no
  other external script, analytics tag, or embed on the page.
- **`rel="noopener noreferrer"`** on every `target="_blank"` link (GitHub,
  LinkedIn), which stops the linked page from getting a JS handle back to
  this tab (reverse tabnabbing).
- **The `/` command panel only ever uses `textContent`**, never `innerHTML`,
  for anything derived from what you type — so typing HTML/script into it
  can't execute anything. The one `innerHTML` in the codebase just clears a
  container to empty on `/clear`.
- **`referrer-policy: strict-origin-when-cross-origin`** — doesn't leak the
  full URL path to third-party sites you link out to.

## What a meta tag can't do — needs to be set at the hosting level

CSP delivered via `<meta>` silently ignores a few directives (`frame-ancestors`,
`sandbox`, `report-to`), and a handful of protections don't have a meta-tag
form at all (`X-Content-Type-Options`, `Strict-Transport-Security`,
`Permissions-Policy` isn't reliably supported as meta either). Real HTTP
response headers cover all of these. I've included ready-made config for the
two most likely hosts:

- **`_headers`** — Netlify reads this automatically, no setup needed beyond
  having the file at the site root.
- **`vercel.json`** — same idea for Vercel, also automatic.
- **GitHub Pages cannot set custom HTTP headers at all** — there's no server
  config surface. If you deploy there, only the meta-tag protections apply;
  for the rest (clickjacking protection via `X-Frame-Options`/
  `frame-ancestors`, HSTS, MIME-sniffing protection), you'd need to put
  Cloudflare (free tier) in front of GitHub Pages and set the headers there
  instead.

## Deliberately out of scope

- **A contact form or any endpoint that accepts input and does something
  with it server-side.** The moment this site gains a backend — a form
  handler, an API route, a database — this whole audit needs redoing,
  because that's where the vulnerability classes above (injection, auth,
  etc.) actually become possible. Right now there's nothing to inject into.
- **DDoS / rate limiting** — outside what a static file can control; your
  host's CDN (Netlify/Vercel/GitHub Pages/Cloudflare) handles this at the
  infrastructure level regardless of what's in the HTML.
- **"100% secure."** Not a claim I'd make about any live system, including
  this one — new browser bugs, new CSP bypass techniques, and misconfigured
  hosting can all still happen. What's true is that the attack surface here
  is about as small as a website's can get, and what's controllable from the
  code has been locked down.
