# Google Sheets Subscriber Backend

This is the recommended low-maintenance setup for this site.

## What You Need

1. A Google Sheet with two tabs:
   - `Subscribers`
   - `ContactMessages`
2. A Google Apps Script project bound to that Sheet or created separately.
3. The script from [`subscriber-backend.gs`](subscriber-backend.gs).
4. A deployment of that script as a web app.

## Sheet Layout

Create the `Subscribers` tab with this header row:

```text
email | subscribed_at | source | status
```

Create the `ContactMessages` tab with this header row:

```text
received_at | name | email | source | message
```

## Script Properties

In Apps Script, open `Project Settings` and add these script properties:

```text
SPREADSHEET_ID=your-google-sheet-id
SUBSCRIBERS_SHEET_NAME=Subscribers
CONTACT_MESSAGES=ContactMessages
CONTACT_TO_EMAIL=ikebenaka@gmail.com
NOTIFY_TOKEN=choose-a-long-random-secret
SITE_NAME=Isaac Benaka
```

## Deploy As Web App

1. Open `Deploy` > `New deployment`.
2. Choose `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Deploy and copy the `/exec` URL.

## Wire It Into This Repo

Set these values in [`site/_data/forms.yml`](../site/_data/forms.yml):

```yml
contact:
  endpoint: "YOUR_SCRIPT_EXEC_URL"

newsletter:
  endpoint: "YOUR_SCRIPT_EXEC_URL"
  fallback_email: "ikebenaka@gmail.com"
  fallback_subject: "Newsletter signup"
```

The site sends:
- `action: "contact"` for the contact form
- `action: "subscribe"` for the newsletter form

## GitHub Notification Setup

In your GitHub repository settings, add:

- repository variable `SITE_URL`
- repository secret `SUBSCRIBER_NOTIFY_ENDPOINT`
- repository secret `SUBSCRIBER_NOTIFY_TOKEN`

Set:
- `SUBSCRIBER_NOTIFY_ENDPOINT` to your Apps Script `/exec` URL
- `SUBSCRIBER_NOTIFY_TOKEN` to the same value as `NOTIFY_TOKEN`

The workflow in [`.github/workflows/notify-subscribers.yml`](../.github/workflows/notify-subscribers.yml) will send:

```json
{
  "action": "notify",
  "token": "your-secret",
  "items": [...]
}
```

## Notes

- This setup is good for a small subscriber list.
- `MailApp` has daily sending limits, so it is fine for low-volume personal-site updates but not bulk newsletter scale.
- If you redeploy the Apps Script, keep the same `/exec` URL updated in the repo if Google gives you a new one.
