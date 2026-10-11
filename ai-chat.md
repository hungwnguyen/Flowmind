# AI Chat & Providers

> AI is an **optional** layer on top of the toolkit. Everything offline keeps working without it.

## Agent Chat

Open **Tools → VinaGen AI Toolkit → Chat** (or **Open AI Chat** in the Welcome window). Agent Chat keeps conversation history, sessions and attachments and talks to the provider you selected.

<div class="vg-pair">
  <figure><img src="images/agent-chat.png" alt="VinaGen Agent Chat window with Chat, History and Settings tabs"><figcaption>Agent Chat: the bridge status shows at the top right.</figcaption></figure>
</div>

- In toolkit chat the assistant introduces itself as **VinaGen**.
- Replies follow the language of your latest message: English → English, Vietnamese (with or without accents) → Vietnamese with full diacritics.
- Generated graph descriptions, labels and metadata default to concise **English**; your own text and explicit localization requests are preserved.

The native graph and design editors also contain chat panels for **Ask** (advice and copyable code), graph generation, white-frame edits and image requests.

## Configure a provider

1. Open **Tools → VinaGen AI Toolkit → Settings → AI Settings** (or **Set up AI** in the Welcome window).
2. Choose a provider listed there — for example **Gemini, OpenAI, Poe, Claude** or **Cursor** — and enter your own credentials.
3. Pick a model available to your account.

Image generation supports **Gemini, OpenAI** and **Poe**. Particle texture generation through Poe reads the key from the `POE_API_KEY` environment variable or a password field that is cleared when the window closes.

> Model availability, quotas and pricing are controlled by the provider. This asset does not include provider credits.

## Credentials

- Credentials are **personal, Editor-only** configuration — never runtime scene components.
- Do not commit credential-bearing settings or put keys in source, assets, MCP payloads or manifests.
- The portable exporter excludes personal settings and personal artwork.

## What gets sent

Online requests may include your prompt, files/images you attach explicitly, the selected graph/design context and project excerpts assembled for that workflow. A connected MCP assistant receives the tool results/context it requests.

The toolkit implements **neither model training nor whole-project telemetry**. Retention and training policies belong to your provider account — review them before sending sensitive content, or use the offline workflows.

---
[Next: Create from Claude Code / Codex](create-from-chat.md)
