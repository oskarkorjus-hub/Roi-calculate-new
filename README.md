# BaliInvest XIRR - Villa ROI Calculator

A React-based investment calculator for Bali real estate projects. Calculate XIRR (Extended Internal Rate of Return) for villa investments with customizable payment plans.

## Features

- **Property Details**: Track project name, location, price, and handover date
- **Payment Terms**: Support for full payment or installment plans with adjustable down payment
- **Exit Strategy**: Configure projected sales price and closing costs
- **Additional Cash Flows**: Track furniture packages, rental income, and other expenses
- **Real-time XIRR**: Automatic calculation using Newton-Raphson method
- **Multi-currency Support**: IDR, USD, AUD, EUR

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Recharts** - Future chart integrations
- **Custom XIRR** - Newton-Raphson implementation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/      # Header, Footer
│   ├── forms/       # PropertyDetails, PaymentTerms, etc.
│   └── display/     # ProjectForecast, Charts
├── hooks/           # useInvestment custom hook
├── types/           # TypeScript interfaces
└── utils/           # XIRR calculation, formatters
```

## Deployment

This project is configured for Vercel deployment:

1. Connect your GitHub repo to Vercel
2. Vercel auto-detects Vite and configures build settings
3. Push to main branch for automatic deployment

## Built for Investland Group

Part of the internal tools ecosystem for Investland Bali, Constructland, and Pellago property management.

---

Built with ❤️ in Bali
