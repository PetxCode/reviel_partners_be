# Reviel Outreach Desk

A single-page console for sending Reviel's partnership outreach sequences. It loads
a sequence workbook (.xlsx), lets you pick which letter to send, review every
recipient, and then either open drafts in your mail client or send directly through
Resend.

Direct send works through a tiny serverless function (`api/send.js`) that holds your
Resend API key server-side. **The key never lives in the browser.**

## Folder structure

```
reviel-outreach-desk/
  index.html        the console (open this in a browser, or deploy it)
  api/
    send.js         serverless function that calls Resend with your secret key
  vercel.json       sets a sane timeout for the function
  .gitignore
  README.md
```

## Deploy to Vercel (free)

1. Create a free account at https://vercel.com

2. Deploy this folder. Either:
   - Drag the folder onto the Vercel dashboard, or
   - From inside the folder, run: `npx vercel`

3. Add your Resend key as an environment variable, not in the code:
   Vercel dashboard -> your project -> Settings -> Environment Variables
   - Name:  `RESEND_API_KEY`
   - Value: your `re_...` key from https://resend.com/api-keys
   Then redeploy (Deployments -> latest -> Redeploy) so the key takes effect.

4. Verify your sending domain in Resend:
   https://resend.com/domains -> Add Domain -> reviel.app
   Add the DNS records it shows you (SPF, DKIM). Your sender address in the console
   must be on this verified domain or Resend will reject the send.

5. Open your deployed page (e.g. `https://reviel-outreach.vercel.app`).
   Expand **Direct send** and enter the endpoint. Because the page and the function
   are in the same project, you can simply use:
   ```
   /api/send
   ```

6. Load the sequence, select recipients, and press **Send selected letters**.
   Each row turns faded-green on success, red on failure (with the reason shown).

## Tighten CORS before real use

`api/send.js` currently allows any origin (`*`) for easy testing. Once it works,
open `api/send.js` and change:

```js
res.setHeader("Access-Control-Allow-Origin", "*");
```

to your actual page origin, for example:

```js
res.setHeader("Access-Control-Allow-Origin", "https://reviel-outreach.vercel.app");
```

so only your console can call your endpoint.

## Use your own hero photo (optional)

The background coastline is drawn in CSS so the page works with no image dependency.
To use a real photograph instead, open `index.html`, find this line near the top of
the `<style>` block:

```css
/* --hero-photo:url("https://www.reviel.app/your-hero.jpg"); */
```

Uncomment it and point it at your image URL. It layers over the gradient and covers
it. Nothing else changes.

## Sending responsibly

- Resend, like most transactional email providers, is intended for mail like
  receipts and confirmations rather than bulk cold outreach. Review Resend's
  acceptable-use policy and your plan's sending limits before running a cold
  campaign, or the account can be suspended.
- Warm the inbox and send in small batches. The function already sends one message
  at a time with a short gap between them.
- The console holds flagged rows back by default. Verify those addresses before
  including them.
- Keep a physical mailing address and an opt-out line in letters 1 and 2 (the
  console's compliance-footer field appends them for you).
