// app.js
const express = require('express');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));

// In-memory store for accepted rates history
let acceptedRatesHistory = [];

// Form page
app.get('/exchange-rate', (req, res) => {
  res.send(`
    <h2>Exchange Rate Lookup</h2>
    <form action="/exchange-rate" method="post">
      <label>Your Name:</label>
      <input type="text" name="name" required /><br/><br/>
      
      <label>Your Email:</label>
      <input type="email" name="email" required /><br/><br/>
      
      <label>Date (YYYY-MM-DD):</label>
      <input type="text" name="date" value="2026-06-11" required /><br/><br/>
      
      <label>Base Currency:</label>
      <input type="text" name="base" value="USD" required /><br/><br/>
      
      <label>Target Currency (symbols):</label>
      <input type="text" name="symbols" placeholder="ZAR" required /><br/><br/>
      
      <button type="submit">Get Rate</button>
    </form>
  `);
});

// Handle Get Rate
app.post('/exchange-rate', async (req, res) => {
  try {
    const { name, email, date, base, symbols } = req.body;

    if (!symbols) {
      return res.status(400).send("Error: 'symbols' is required.");
    }

    const url = `https://api.frankfurter.dev/v1/${date}?base=${base}&symbols=${symbols}`;
    const response = await axios.get(url);

    const rate = response.data.rates[symbols];
    const combinedKey = `${base}${symbols}`;
    const resultText = `${combinedKey}: ${rate}`;

    // Show result with Accept/Decline options
    res.send(`
      <h3>Exchange Rate Result</h3>
      <p>Requestor: ${name} (${email})</p>
      <p>User Input: Date=${date}, Base=${base}, Symbols=${symbols}</p>
      <p><strong>${resultText}</strong></p>
      
      <form action="/exchange-rate" method="get">
        <button type="submit">Decline & Go Back</button>
      </form>
      
      <form action="/accept-rate" method="post">
        <input type="hidden" name="name" value="${name}" />
        <input type="hidden" name="email" value="${email}" />
        <input type="hidden" name="date" value="${date}" />
        <input type="hidden" name="base" value="${base}" />
        <input type="hidden" name="symbols" value="${symbols}" />
        <input type="hidden" name="result" value="${resultText}" />
        <button type="submit">Accept Rate</button>
      </form>
    `);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Failed to fetch exchange rate data.");
  }
});

// Accept rate and save in history
app.post('/accept-rate', (req, res) => {
  const { name, email, date, base, symbols, result } = req.body;

  acceptedRatesHistory.push({
    id: acceptedRatesHistory.length + 1,
    name,
    email,
    date,
    base,
    symbols,
    result,
    timestamp: new Date().toISOString() // GMT timestamp
  });

  res.send(`
    <h3>Rate Accepted</h3>
    <p>${result} saved for ${name} (${email}) on ${date}</p>
    <a href="/exchange-rate">Back to Exchange Rate</a><br/>
    <a href="/accept-rate">View Accepted Rates History</a>
  `);
});

// Show accepted rates history in table format
app.get('/accept-rate', (req, res) => {
  if (acceptedRatesHistory.length === 0) {
    return res.send("<h3>No accepted rates yet.</h3><a href='/exchange-rate'>Back</a>");
  }

  let tableHtml = `
    <h2>Accepted Rates History</h2>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>#</th>
        <th>Requestor</th>
        <th>Email</th>
        <th>Date</th>
        <th>Time (GMT+2)</th>
        <th>Result</th>
        <th>Download</th>
      </tr>
  `;

  acceptedRatesHistory.forEach((rate) => {
    const gmtPlus2 = new Date(rate.timestamp).toLocaleString("en-GB", { timeZone: "Africa/Johannesburg" });
    tableHtml += `
      <tr>
        <td>${rate.id}</td>
        <td>${rate.name}</td>
        <td>${rate.email}</td>
        <td>${rate.date}</td>
        <td>${gmtPlus2}</td>
        <td>${rate.result}</td>
        <td><a href="/download-rate/${rate.id}">Download PDF</a></td>
      </tr>
    `;
  });

  tableHtml += "</table><br/><a href='/exchange-rate'>Back</a>";
  res.send(tableHtml);
});

// Download individual accepted rate as PDF
app.get('/download-rate/:id', (req, res) => {
  const rate = acceptedRatesHistory.find(r => r.id === parseInt(req.params.id));
  if (!rate) {
    return res.status(404).send("Rate not found.");
  }

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=accepted-rate-${rate.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text('Accepted Exchange Rate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Requestor: ${rate.name}`);
  doc.text(`Email: ${rate.email}`);
  doc.text(`Date: ${rate.date}`);
  doc.text(`Time (GMT+2): ${new Date(rate.timestamp).toLocaleString("en-GB", { timeZone: "Africa/Johannesburg" })}`);
  doc.text(`Result: ${rate.result}`);

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/exchange-rate`);
});

