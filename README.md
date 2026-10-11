# FlowForge AI

A static Phase 1 n8n workflow builder for WhatsApp Business automation. Open `dist/index.html` through a local static server, or publish `dist/` to GitHub Pages. The app has no server, database, AI calls or live WhatsApp calls. Drafts stay in browser local storage.

## What works

- Four WhatsApp templates: customer support, lead qualification, FAQ assistant and order update desk.
- Business knowledge entry, ART prompt builder, deterministic conversation preview, visual flow outline, JSON generation, structural validation, import and export.
- Generated n8n JSON contains GET Meta verification and POST message webhooks, text filtering, handoff routing, knowledge context, AI provider request, reply extraction, outbound WhatsApp Cloud API request and logging.

## Run locally

From this folder, use any static server, for example `python3 -m http.server 8080 --directory dist`, and open `http://localhost:8080`. ES modules require HTTP rather than opening the file directly. Run tests with `npm test` (Node 18+). No package installation is required. Tailwind's browser CDN supplies some utility classes, while the bundled CSS provides the full layout.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In repository **Settings → Pages**, choose **Deploy from a branch**.
3. Choose the branch and `/docs` folder. Copy the contents of `dist/` into `/docs` before committing, or use a GitHub Actions static Pages deployment that uploads `dist/`.
4. Open the Pages URL. Relative asset paths work under a repository subpath.

## Import and activate in n8n

1. Fill in the studio, generate and download JSON. In n8n, import it as a workflow file.
2. Confirm node compatibility with your installed n8n version. The UI lets you label a target release, but cannot guarantee every node parameter across releases. The generated workflow is inactive by default.
3. Set `META_VERIFY_TOKEN` in the n8n server environment. Configure the Meta app webhook callback to the production GET and POST endpoint at `/webhook/flowforge-meta`. Use the verify token from that environment setting. n8n may require adapting GET and POST webhooks sharing a path, depending on version and routing configuration.
4. Add an OpenAI credential to the AI request node and an HTTP Header Auth credential with `Authorization: Bearer <Meta access token>` to the outbound request node. Select credentials inside n8n; no secrets are stored by FlowForge.
5. Confirm the Meta phone number ID and Graph API version. Configure the Meta app to subscribe to messages. Review Meta's current WhatsApp Cloud API requirements and messaging limits.
6. Replace the console-only handoff and delivery logs with your real notification and durable logging destinations. Test sample payloads and failures before activation. Consider request signature verification, deduplication by message ID, retry handling, rate limits, and consent requirements for production.

The generated AI node currently uses OpenAI Chat Completions as a concrete credential placeholder. The provider selector is limited to OpenAI in Phase 1. A future secure backend may support other providers, natural-language workflow synthesis, and n8n REST deployment. Browser-based API key storage is intentionally absent.

## Security and privacy

Never paste API keys or Meta access tokens into app fields. Business knowledge is stored in browser local storage and embedded in exported JSON, so review it before sharing. The offline conversation lab is a simple rules preview; it is not evidence that the live AI will answer identically. For production, store secrets in n8n credentials and keep the n8n instance secured.

## Architecture

- `dist/index.html`, `dist/styles.css`: static UI.
- `dist/js/app.js`: state, views and browser interactions.
- `dist/js/engine.js`: templates, ART prompt, workflow generator, validation and offline simulator.
- `tests/engine.test.js`: generator and simulator checks.
- `examples/whatsapp-customer-support.json`: example export.

## Update the GitHub Pages site

Edit files under `dist/`, then run `python3 scripts/publish_pages.py --push --message "Describe your change"`. The script runs tests, copies `dist/` to `docs/`, commits and pushes to `main`. GitHub Actions then deploys `docs/` to Pages. For a local preview of the sync, omit `--push`.

GitHub Pages is configured to use GitHub Actions. The workflow at `.github/workflows/pages.yml` handles each later push. Git must be authenticated on your machine to use `--push`.

## Install on a phone

FlowForge AI is a Progressive Web App. Open the [GitHub Pages site](https://aicoder143.github.io/flowforge/) on your phone and tap **Install app**. On iPhone or iPad, use Safari's **Share → Add to Home Screen** if the browser does not show an install prompt. On Android, use Chrome's **Install app** or **Add to Home Screen** option. The installed app opens in its own window and caches the builder for offline use. Drafts remain in that device's browser storage; they are not synced between devices. Live AI and WhatsApp integrations still require n8n setup.
