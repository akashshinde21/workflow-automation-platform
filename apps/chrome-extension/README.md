# Chrome extension release checklist

## What I can prepare in the repository

The extension build is configured to produce a Chrome-loadable folder at `apps/chrome-extension/dist` containing:

- `manifest.json`
- `popup.html` and `popup.js`
- `editor.html` and `editor.js`
- `background.js`

Build it from the repository root:

```bash
npm install
npm run build --workspace @workflow/chrome-extension
```

## Install locally in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose the absolute folder `apps/chrome-extension/dist`.
5. Pin **Workflow Studio** and click its toolbar icon.

After source changes, run the build command again and click the extension's reload button on `chrome://extensions`.

## Publish to the Chrome Web Store

Publishing cannot be completed by repository automation because it requires your Google account, identity/payment setup, store listing, privacy declarations, and the final submission in the Chrome Developer Dashboard.

On your computer:

```bash
cd apps/chrome-extension
zip -r workflow-studio-0.1.0.zip dist
```

Then open the Chrome Web Store Developer Dashboard, choose **New item**, upload the ZIP, complete the store listing and privacy sections, and submit it for review.

## Important limitations

- The current extension stores workflows locally with `chrome.storage.local`.
- It is not connected automatically to the API at `localhost:3001`.
- Chrome Web Store publishing requires a developer account and may require a one-time registration fee.
- Review time and approval are controlled by Google.
