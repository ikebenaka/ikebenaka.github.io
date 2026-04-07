function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var action = payload.action || "";

    if (action === "contact") {
      return jsonResponse_(handleContact_(payload));
    }

    if (action === "subscribe") {
      return jsonResponse_(handleSubscribe_(payload));
    }

    if (action === "notify") {
      return jsonResponse_(handleNotify_(payload));
    }

    return jsonResponse_({ message: "Unknown action." }, 400);
  } catch (error) {
    return jsonResponse_({ message: error.message || "Unexpected error." }, 500);
  }
}

function handleContact_(payload) {
  var name = (payload.name || "").trim();
  var email = normalizeEmail_(payload.email);
  var message = (payload.message || "").trim();
  var source = (payload.source || "").trim();

  if (!name || !email || !message) {
    return { ok: false, status: 400, message: "Please fill in your name, email, and message." };
  }

  appendRow_("CONTACT_MESSAGES", [
    new Date(),
    name,
    email,
    source,
    message
  ]);

  var ownerEmail = getRequiredProperty_("CONTACT_TO_EMAIL");
  var subject = "Website message from " + name;
  var body = [
    "Name: " + name,
    "Email: " + email,
    "Source: " + source,
    "",
    message
  ].join("\n");

  MailApp.sendEmail(ownerEmail, subject, body, {
    replyTo: email
  });

  return { ok: true, message: "Thanks for reaching out. Your message has been sent." };
}

function handleSubscribe_(payload) {
  var email = normalizeEmail_(payload.email);
  var source = (payload.source || "").trim();

  if (!email) {
    return { ok: false, status: 400, message: "Please enter an email address." };
  }

  var subscribersSheet = getSheetByProperty_("SUBSCRIBERS_SHEET_NAME");
  var emails = subscribersSheet.getRange(2, 1, Math.max(subscribersSheet.getLastRow() - 1, 0), 1).getValues()
    .map(function (row) { return normalizeEmail_(row[0]); })
    .filter(Boolean);

  if (emails.indexOf(email) === -1) {
    subscribersSheet.appendRow([
      email,
      new Date(),
      source,
      "active"
    ]);
  }

  return { ok: true, message: "Thanks for subscribing. You will get an email when something new is published." };
}

function handleNotify_(payload) {
  var expectedToken = getRequiredProperty_("NOTIFY_TOKEN");
  var providedToken = (payload.token || "").trim();

  if (!expectedToken || providedToken !== expectedToken) {
    return { ok: false, status: 401, message: "Unauthorized." };
  }

  var items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    return { ok: true, message: "No new posts or projects to notify." };
  }

  var subscribersSheet = getSheetByProperty_("SUBSCRIBERS_SHEET_NAME");
  var values = subscribersSheet.getDataRange().getValues();
  var subscribers = values.slice(1).filter(function (row) {
    return normalizeEmail_(row[0]) && String(row[3] || "active").toLowerCase() === "active";
  });

  if (!subscribers.length) {
    return { ok: true, message: "No subscribers to notify." };
  }

  var siteName = getRequiredProperty_("SITE_NAME");
  var subject = items.length === 1 ? "New update from " + siteName : "New updates from " + siteName;
  var body = buildDigestEmail_(items, siteName);

  subscribers.forEach(function (row) {
    MailApp.sendEmail(String(row[0]).trim(), subject, body);
  });

  return { ok: true, message: "Sent " + items.length + " update(s) to " + subscribers.length + " subscriber(s)." };
}

function buildDigestEmail_(items, siteName) {
  var lines = ["Something new just went live on " + siteName + ".", ""];

  items.forEach(function (item) {
    lines.push(item.title + " (" + item.type + ")");
    if (item.description) {
      lines.push(item.description);
    }
    lines.push(item.url);
    lines.push("");
  });

  return lines.join("\n");
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body.");
  }

  var parsed = JSON.parse(e.postData.contents);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid request body.");
  }

  return parsed;
}

function appendRow_(sheetPropertyName, rowValues) {
  getSheetByProperty_(sheetPropertyName).appendRow(rowValues);
}

function getSheetByProperty_(propertyName) {
  var spreadsheetId = getRequiredProperty_("SPREADSHEET_ID");
  var sheetName = getRequiredProperty_(propertyName);
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Missing sheet: " + sheetName);
  }

  return sheet;
}

function getRequiredProperty_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error("Missing script property: " + name);
  }
  return value;
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function jsonResponse_(payload, forcedStatus) {
  var status = forcedStatus || payload.status || 200;
  var body = Object.assign({}, payload);
  delete body.status;
  body.ok = body.ok !== false;

  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
