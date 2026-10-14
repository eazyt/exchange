# Exchange Rate Lookup App

A simple Node.js web app that lets users look up currency exchange rates for a specific date, accept or decline the rate, and download a PDF receipt of accepted rates.

## What It Does

1. User fills out a form with their name, email, a date, a base currency, and a target currency
2. The app fetches the exchange rate from the [Frankfurter API](https://www.frankfurter.dev)
3. User can **accept** or **decline** the rate
4. Accepted rates are saved to an in-memory history table
5. Each accepted rate can be downloaded as a **PDF**

## Routes

| Route | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/exchange-rate` | GET | Exchange rate form |
| `/exchange-rate` | POST | Fetches and displays the rate |
| `/accept-rate` | POST | Saves an accepted rate |
| `/accept-rate` | GET | View all accepted rates history |
| `/download-rate/:id` | GET | Download a rate as PDF |

## Tech Stack

- **[Express](https://expressjs.com/)** — web server and routing
- **[Axios](https://axios-http.com/)** — HTTP requests to the Frankfurter API
- **[PDFKit](https://pdfkit.org/)** — PDF generation
- **[Nodemon](https://nodemon.io/)** — auto-restart during development

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed

### Install dependencies

```bash
npm install
```

### Run the app

**Production:**
```bash
npm start
```

**Development (auto-restart on file changes):**
```bash
npm run dev
```

The app runs on [http://localhost:3000/exchange-rate](http://localhost:3000/exchange-rate)

## Notes

- Exchange rates are sourced from the free [Frankfurter API](https://www.frankfurter.dev) — no API key required
- Accepted rates are stored **in memory only** and will reset when the server restarts
- Timestamps are stored in UTC and displayed in **GMT+2 (Johannesburg time)**
