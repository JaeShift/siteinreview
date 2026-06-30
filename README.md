# Kitsune Brewing Co. — Website

Custom Next.js 14 full-stack rebuild of the Kitsune Brewing Co. website, migrated from Squarespace.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS-in-JSX (`styled-jsx`)
- **Email**: [Resend](https://resend.com)
- **Validation**: [Zod](https://zod.dev)
- **Deployment**: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key — get one at [resend.com](https://resend.com/api-keys) |
| `CONTACT_EMAIL_TO` | Email address that receives contact form submissions |
| `CONTACT_EMAIL_FROM` | Verified sender domain email for Resend |

> **Note:** While testing locally, you can set `CONTACT_EMAIL_FROM=onboarding@resend.dev` (Resend's default test sender).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
app/                      App Router pages and API routes
  page.tsx                Home (hero, menu, events calendar)
  contact/page.tsx        Contact Us page
  casino-night/page.tsx   Casino Night event page
  magic-mamas-pre-release/page.tsx   Magic Mamas holding page
  mtg-and-more/
    page.tsx              MTG event listing
    [slug]/page.tsx       Individual event/product detail
  api/
    contact/route.ts      POST — validate + send email via Resend

components/               Shared React components
  Header.tsx              Sticky nav with mobile hamburger
  Footer.tsx              Address, hours, social, navigation
  Hero.tsx                Full-width banner image section
  MenuEmbed.tsx           Taplist.io menu iframe
  CalendarEmbed.tsx       Google Calendar iframe
  PromoTixEmbed.tsx       PromoTix ticket widget iframe
  PageSection.tsx         Reusable section wrapper
  ContactForm.tsx         Client-side contact form (fetch → /api/contact)
  Button.tsx              Primary / outline button
  SocialLinks.tsx         Instagram + Facebook icon links
  EventCard.tsx           MTG product/event card

lib/
  email.ts                Resend email sending wrapper
  validation.ts           Zod schema for contact form
  mtg-products.ts         MTG product/event data

public/images/            Static assets (logo, banner, section headers, favicon)
styles/globals.css        CSS variables, reset, base typography, utility classes
```

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero banner, live menu (Taplist.io), events calendar (Google Calendar) |
| `/casino-night` | Casino Night — event info, PromoTix ticket embed |
| `/mtg-and-more` | MTG and More — event/product listing grid |
| `/mtg-and-more/[slug]` | Product detail — image, price, description, Add to Cart |
| `/magic-mamas-pre-release` | Coming soon holding page |
| `/contact` | Contact Us — form + address/phone/social |

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the required environment variables in the Vercel dashboard
4. Deploy

## Adding New MTG Events

Edit `lib/mtg-products.ts` to add, update, or remove event/product cards on the MTG and More page.

## Future Features

This codebase is structured to grow into:

- Admin-managed events (database + CMS integration)
- Newsletter signup
- Menu/product updates via API
- Blog or news posts
- Full ecommerce / booking flow
- Email and SMS notifications
- Loyalty or rewards program
