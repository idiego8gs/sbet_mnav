export default async function handler(req, res) {
  const TWELVE_API_KEY = process.env.TWELVE_API_KEY;

  const TOTAL_SHARES = 99_950_000;
  const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTO6ExFyN8r3JLHutCpoJFPKdLlFq2yTQxMm_Bf5a5jtYvRF51PfOBcVa2FCIVFEznTxhQKWZQgypyb/pub?gid=0&single=true&output=csv';

  try {
    // 取得 SBET 現價
    const sbetRes = await fetch(
      `https://api.twelvedata.com/quote?symbol=SBET&apikey=${TWELVE_API_KEY}`
    );
    const sbet = await sbetRes.json();
    const sbetPrice = parseFloat(sbet.close);
    const marketCap = sbetPrice * TOTAL_SHARES;

    // 取得 ETH 現價（USD）
    const ethRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const eth = await ethRes.json();
    const ethPrice = eth.ethereum.usd;

    // 從 Google Sheets 讀取 ETH 持有量（CSV 格式）
    const csvRes = await fetch(SHEET_CSV_URL);
    const csvText = await csvRes.text();
    const lines = csvText.trim().split('\n');
    const row = lines[0].split(',');
    const rawValue = row[1];
    const ethAmount = parseFloat(rawValue.replace(/[^\d.]/g, ''));

    // 計算 ETH 價值與 mNAV
    const ethValue = ethAmount * ethPrice;
    const mnav = ethValue / marketCap;

    // 回傳 JSON
    res.status(200).json({
      price: sbetPrice.toFixed(4),         // SBET 現價
      market_cap: marketCap.toFixed(0),    // 市值
      eth_price: ethPrice.toFixed(2),      // ETH 現價
      eth_amount: ethAmount.toFixed(4),    // ETH 數量
      eth_value: ethValue.toFixed(0),      // ETH 價值
      mnav: mnav.toFixed(6)                // mNAV
    });

  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch data',
      details: err.message
    });
  }
}
