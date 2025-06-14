const express = require('express');
const bodyParser = require('body-parser');
const Mercury = require('@postlight/parser'); // ← This is the new package
const { chromium } = require('playwright');

const app = express();
app.use(bodyParser.json());

app.post('/extract', async (req, res) => {
  const { url } = req.body;
  try {
    // Try fast path: Mercury Parser
    let result = await Mercury.parse(url);
    let text = result && result.content ? result.content.replace(/<[^>]+>/g, '') : '';

    // If Mercury fails or gets < 300 chars, fallback to Playwright
    if (!text || text.length < 300) {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const html = await page.content();
      await browser.close();
      result = await Mercury.parse(url, { html });
      text = result && result.content ? result.content.replace(/<[^>]+>/g, '') : '';
    }
    res.json({ content: text });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(3000, () => {
  console.log('Extractor Node.js API running on port 3000');
});
