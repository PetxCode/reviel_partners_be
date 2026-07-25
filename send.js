// api/send.js
// A tiny serverless proxy for Resend. Deploy on Vercel (Node runtime).
// The Resend API key lives ONLY here, as an environment variable named RESEND_API_KEY.
// It is never sent to, or stored in, the browser.
//
// The browser posts { from, to, subject, text } to this endpoint.
// This function adds the secret key and forwards the request to Resend.

export default async function handler(req, res) {
  // --- CORS ---
  // If you host the console on the SAME Vercel project, calls are same-origin and
  // this block is harmless. If the console is served from another origin, replace
  // "*" with that exact origin, e.g. "https://outreach.reviel.app".
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: "RESEND_API_KEY is not set on the server" });

  try {
    // Vercel's Node runtime parses JSON bodies automatically. If req.body is empty,
    // read the raw stream as a fallback.
    let body = req.body;
    if (!body || typeof body !== "object") {
      const raw = await new Promise((resolve) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", () => resolve(d));
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const { from, to, subject, text } = body;
    if (!to || !subject) return res.status(400).json({ error: "Missing 'to' or 'subject'" });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 'from' must be an address on a domain you have verified in Resend.
        from: from || "Peter Oti <peter.oti@reviel.app>",
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
      }),
    });

    const data = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) return res.status(resendRes.status).json(data);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
