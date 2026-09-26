import { useId, type ReactNode } from "react";

export const DATA_PAGE_PATH = "/data";

const POLICIES = [
  { label: "OpenAI: how API data is used and kept", href: "https://developers.openai.com/api/docs/guides/your-data" },
  { label: "OpenAI: privacy policy", href: "https://openai.com/policies/privacy-policy/" },
  { label: "OpenRouter: data collection", href: "https://openrouter.ai/docs/guides/privacy/data-collection" },
  { label: "OpenRouter: provider logging", href: "https://openrouter.ai/docs/guides/privacy/provider-logging" },
  { label: "OpenRouter: privacy policy", href: "https://openrouter.ai/privacy" },
];

export function DataPage() {
  return (
    <main className="data-page">
      <a href="/">Back to the coach</a>
      <h1>Where your text goes</h1>
      <Routing />
      <Retention />
      <Training />
      <ServerLogs />
      <InYourBrowser />
      <Policies />
    </main>
  );
}

function Routing() {
  return (
    <Section heading="Who handles it">
      <p>
        When you press Send, your browser sends your message, with your swaps applied, to our server, along with the
        conversation so far and any glossary rows you kept. Our server passes it to OpenRouter, which routes it to a
        model provider. OpenRouter currently routes it to OpenAI's own API.
      </p>
    </Section>
  );
}

function Retention() {
  return (
    <Section heading="How long it's kept">
      <p>OpenAI may keep your messages and its replies for up to 30 days in abuse-monitoring logs.</p>
      <p>
        OpenRouter doesn't store messages or replies unless the account opts in to logging, which is off by default.
        It keeps request metadata, such as token counts and latency, and may sample a few messages for anonymous
        categorization, not tied to the account.
      </p>
    </Section>
  );
}

function Training() {
  return (
    <Section heading="Training">
      <p>
        OpenAI doesn't use API data for training by default. OpenRouter uses messages and replies only if the account
        opts in, which is off by default.
      </p>
    </Section>
  );
}

function ServerLogs() {
  return (
    <Section heading="What our server keeps">
      <p>Nothing you type. Our server doesn't save messages, replies, swaps or glossary rows.</p>
      <p>
        Its logs record only the error name and status code when the coach fails or times out, and how many citations
        it removed from a reply because it couldn't verify them.
      </p>
    </Section>
  );
}

function InYourBrowser() {
  return (
    <Section heading="What stays in your browser">
      <p>
        Your swaps are saved in this browser and never sent. The browser replaces each word with its placeholder
        before sending, and puts the real word back in the reply.
      </p>
      <p>
        Glossary rows you keep are saved in this browser too, and sent with each message so the coach can use them.
        The conversation itself isn't saved: reloading or closing the tab clears it.
      </p>
    </Section>
  );
}

function Policies() {
  return (
    <Section heading="Policies">
      <ul>
        {POLICIES.map(({ label, href }) => (
          <li key={href}>
            <a href={href} rel="noreferrer" target="_blank">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      {children}
    </section>
  );
}
