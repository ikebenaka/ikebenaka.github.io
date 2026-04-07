# Isaac Benaka Website

This repo builds the GitHub Pages version of Isaac Benaka's personal site with Jekyll and Bookshop.

## Develop

Install the front-end dependencies:

```bash
npm install
```

Install the Jekyll gems:

```bash
npm run jekyll:install
```

Run the site locally:

```bash
npm start
```

## Form Handling And Subscriber Emails

GitHub Pages only serves static files, so it cannot receive contact form submissions or maintain a subscriber list by itself. This repo now includes a Google Sheets based path that keeps everything lightweight and easy to manage:

1. The site forms post to configurable API endpoints from [`site/_data/forms.yml`](site/_data/forms.yml).
2. A Google Apps Script backend template is included in [`google-apps-script/subscriber-backend.gs`](google-apps-script/subscriber-backend.gs).
3. A setup guide for Google Sheets lives in [`google-apps-script/SETUP.md`](google-apps-script/SETUP.md).
4. A GitHub Action at [`.github/workflows/notify-subscribers.yml`](.github/workflows/notify-subscribers.yml) sends new-post notifications after publish.

### Recommended Setup

1. Create a Google Sheet with `Subscribers` and `ContactMessages` tabs.
2. Add the Apps Script from [`google-apps-script/subscriber-backend.gs`](google-apps-script/subscriber-backend.gs).
3. Deploy the Apps Script as a web app.
4. Put the Apps Script `/exec` URL in [`site/_data/forms.yml`](site/_data/forms.yml):
   `contact.endpoint` and `newsletter.endpoint`.
5. In GitHub repo settings, add:
   `vars.SITE_URL`
   `secrets.SUBSCRIBER_NOTIFY_ENDPOINT`
   `secrets.SUBSCRIBER_NOTIFY_TOKEN`

For the detailed step-by-step, use [`google-apps-script/SETUP.md`](google-apps-script/SETUP.md).

### What works right now

- The broken `405` contact form path has been removed.
- The stale Mailchimp embed has been removed.
- If the API endpoints are not configured yet, both forms fall back to opening a prefilled email instead of failing silently.
