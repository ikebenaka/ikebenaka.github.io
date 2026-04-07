export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }), env, origin);
      }

      if (request.method === "GET" && url.pathname === "/api/health") {
        return withCors(json({ ok: true }), env, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/contact") {
        return withCors(await handleContact(request, env), env, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/subscribe") {
        return withCors(await handleSubscribe(request, env), env, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/notify") {
        return withCors(await handleNotify(request, env), env, origin);
      }

      return withCors(json({ message: "Not found" }, 404), env, origin);
    } catch (error) {
      return withCors(
        json({ message: error instanceof Error ? error.message : "Unexpected server error." }, 500),
        env,
        origin
      );
    }
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function withCors(response, env, origin) {
  const headers = new Headers(response.headers);
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  const responseOrigin = allowedOrigin === "*" ? "*" : origin === allowedOrigin ? origin : allowedOrigin;
  headers.set("Access-Control-Allow-Origin", responseOrigin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

async function handleContact(request, env) {
  const body = await readJson(request);
  const name = body?.name?.trim();
  const email = normalizeEmail(body?.email);
  const message = body?.message?.trim();

  if (!name || !email || !message) {
    return json({ message: "Please fill in your name, email, and message." }, 400);
  }

  await sendWithResend(env, {
    to: env.CONTACT_TO_EMAIL,
    reply_to: email,
    subject: `Website message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Source:</strong> ${escapeHtml(body?.source || "")}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `
  });

  return json({ message: "Thanks for reaching out. Your message has been sent." });
}

async function handleSubscribe(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body?.email);

  if (!email) {
    return json({ message: "Please enter an email address." }, 400);
  }

  const key = `subscriber:${email}`;
  const existing = await env.SUBSCRIBERS.get(key, { type: "json" });

  if (!existing) {
    await env.SUBSCRIBERS.put(key, JSON.stringify({
      email,
      source: body?.source || "",
      subscribedAt: new Date().toISOString()
    }));
  }

  return json({ message: "Thanks for subscribing. You will get an email when something new is published." });
}

async function handleNotify(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const expectedHeader = `Bearer ${env.NOTIFY_SIGNING_TOKEN}`;

  if (!env.NOTIFY_SIGNING_TOKEN || authHeader !== expectedHeader) {
    return json({ message: "Unauthorized" }, 401);
  }

  const body = await readJson(request);
  const items = Array.isArray(body?.items) ? body.items.filter(Boolean) : [];

  if (!items.length) {
    return json({ message: "No new posts or projects to notify." });
  }

  const subscribers = await listSubscribers(env);

  if (!subscribers.length) {
    return json({ message: "No subscribers to notify." });
  }

  const subject = items.length === 1
    ? `New ${items[0].type} from Isaac Benaka`
    : `New updates from Isaac Benaka`;
  const html = buildDigestHtml(items, env.SITE_URL || "");

  await Promise.all(
    subscribers.map((subscriber) =>
      sendWithResend(env, {
        to: subscriber.email,
        subject,
        html
      })
    )
  );

  return json({ message: `Sent ${items.length} update(s) to ${subscribers.length} subscriber(s).` });
}

async function listSubscribers(env) {
  const { keys } = await env.SUBSCRIBERS.list({ prefix: "subscriber:" });
  const subscribers = await Promise.all(
    keys.map(async ({ name }) => env.SUBSCRIBERS.get(name, { type: "json" }))
  );

  return subscribers.filter(Boolean);
}

function buildDigestHtml(items, siteUrl) {
  const intro = items.length === 1
    ? "A new update just went live on the site."
    : "A few new updates just went live on the site.";

  const listMarkup = items.map((item) => {
    const link = item.url.startsWith("http") ? item.url : `${siteUrl.replace(/\/$/, "")}${item.url}`;
    const description = item.description ? `<p>${escapeHtml(item.description)}</p>` : "";
    return `
      <li style="margin-bottom: 24px;">
        <p style="margin: 0 0 6px;"><strong>${escapeHtml(item.title)}</strong> (${escapeHtml(item.type)})</p>
        ${description}
        <p style="margin: 0;"><a href="${escapeAttribute(link)}">Read it here</a></p>
      </li>
    `;
  }).join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>${intro}</p>
      <ul style="padding-left: 20px;">
        ${listMarkup}
      </ul>
    </div>
  `;
}

async function sendWithResend(env, payload) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_FROM_EMAIL) {
    throw new Error("Missing Resend configuration.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.NOTIFY_FROM_EMAIL,
      ...payload
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${errorText}`);
  }
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}
