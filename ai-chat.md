# AI Chat & Providers

Use Agent Chat to ask questions and create content with your own AI provider.

## Set up

1. Open **Tools → VinaGen AI Toolkit → Open → Settings → AI Provider Settings**.
2. Select a provider and enter your credentials.
3. Choose a model available to your account.
4. Open **Tools → VinaGen AI Toolkit → Chat**.

### Get an API key

| Provider | Where to get a key | Environment variable |
| --- | --- | --- |
| Gemini | [Google AI Studio → API keys](https://aistudio.google.com/app/apikey) | `GEMINI_API_KEY` or `GOOGLE_API_KEY` |
| OpenAI | [OpenAI Platform → API keys](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Poe | [Poe → API key](https://poe.com/api_key) | `POE_API_KEY` |

Sign in, create a key and paste it into that provider's **API Keys** section. The **Get API Key** button in Settings also opens the provider's page. OpenAI bills by usage and needs credit on the account before API calls work.

![Agent Chat window](images/agent-chat.png)

Chat keeps sessions, history and attachments. Replies follow your latest message's language. Specify the output language when creating screen copy or graph labels.

![AI Provider Settings with provider, model and collapsed API Keys](images/settings-ai.png)

Expand **AI Chat**, choose **Active Provider**, then **Refresh Models / Select Model** or **Custom Model**. Credentials live in **API Keys**; this capture keeps that section closed. See [Settings](settings.md) for chat, image and particle output options.

## Costs and data

Provider chat and image generation use your account's quota or credits. Graph editing, UI design and offline particle tools can be used without provider access.

Online requests may include your prompt, attachments and context collected for that workflow. Keep API keys in personal Editor settings; exclude credential-bearing settings from version control and shared packages.

For particle images, **Authoring Tools → Poe Image** uses a temporary password field or the `POE_API_KEY` environment variable.

To work from an external assistant, see [Create from Claude Code / Codex](create-from-chat.md).
