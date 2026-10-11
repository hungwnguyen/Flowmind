# AI Chat & Providers

Use Agent Chat to ask questions and create content with your own AI provider.

## Set up

1. Open **Tools → VinaGen AI Toolkit → Settings → AI Settings**.
2. Select a provider and enter your credentials.
3. Choose a model available to your account.
4. Open **Tools → VinaGen AI Toolkit → Chat**.

![Agent Chat window](images/agent-chat.png)

Chat keeps sessions, history and attachments. Replies follow your latest message's language. Specify the output language when creating screen copy or graph labels.

## Costs and data

Provider chat and image generation use your account's quota or credits. Graph editing, UI design and offline particle tools can be used without provider access.

Online requests may include your prompt, attachments and context collected for that workflow. Keep API keys in personal Editor settings; exclude credential-bearing settings from version control and shared packages.

For particle images, **Authoring Tools → Poe Image** uses a temporary password field or the `POE_API_KEY` environment variable.

To work from an external assistant, see [Create from Claude Code / Codex](create-from-chat.md).
