// netlify/functions/prices.js
// Replaces your Java StockService — runs serverlessly on Netlify.
// No dependencies needed; uses the built-in fetch available in Node 18+.

const SYMBOLS = [
  // India (NSE)
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  // USA
  "MSFT",
  "ORCL",
  "GOOGL",
  "NVDA",
  "CSCO",
  "AVGO",
  "LLY",
];

exports.handler = async () => {
  try {
    const joined = SYMBOLS.join(",");
    const url =
      `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${joined}&range=1d&interval=1m`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const json = await response.json();
    const results = json?.spark?.result ?? [];

    const stocks = results.map((item) => {
      const symbol        = item.symbol;
      const meta          = item?.response?.[0]?.meta ?? {};
      const price         = meta.regularMarketPrice ?? 0;
      const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price;

      return { symbol, price, previousClose };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Allow the browser to call this from any origin (safe for public data)
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(stocks),
    };
  } catch (err) {
    console.error("prices function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch stock prices" }),
    };
  }
};
