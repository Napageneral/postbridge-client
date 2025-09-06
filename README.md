## Postbridge Tweet Scheduler (Next.js)

A minimal Next.js (TypeScript) web app to:

- Paste long text
- Parse it into discrete tweet-sized posts via an LLM
- Schedule one per day at 9pm using Post-Bridge across selected social accounts

### Quick Start

1) Install deps

```bash
npm install
```

2) Configure environment

Copy `.env.example` to `.env.local` and set your keys:

```bash
cp .env.example .env.local
```

Environment variables:

- `OPENAI_API_KEY`: LLM provider key (or other compatible provider)
- `POSTBRIDGE_API_KEY`: Post-Bridge API key
- `POSTBRIDGE_BASE_URL` (optional): defaults to `https://api.post-bridge.com`
- `DEFAULT_TIMEZONE` (optional): IANA TZ for scheduling (e.g. `America/Los_Angeles`)
- `DEFAULT_POST_HOUR_LOCAL` (optional): local hour (0–23), defaults to `21` (9pm)

3) Run dev server

```bash
npm run dev
```

4) Open `http://localhost:3000`

### Deployment

Deploy to Vercel. Configure the same environment variables in your project settings.

One-click deploy:

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNapageneral%2Fpostbridge-client&project-name=tweet-like-nikita&repository-name=postbridge-client&env=OPENAI_API_KEY,POSTBRIDGE_API_KEY,POSTBRIDGE_BASE_URL,DEFAULT_TIMEZONE,DEFAULT_POST_HOUR_LOCAL&envDescription=LLM%20and%20Post-Bridge%20keys&envLink=https%3A%2F%2Fwww.post-bridge.com%2Fdashboard%2Fapi-keys)
```

### Security

- Never commit `.env*` files; `.gitignore` already excludes them
- API keys are only used server-side in API routes

### Notes

- All code is TypeScript and raw HTTP/JSON. No ORM is used for queries.
- Post-Bridge API docs: `https://api.post-bridge.com/reference#tag/post-results`
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
