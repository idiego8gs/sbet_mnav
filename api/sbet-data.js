export default async function handler(req, res) {
  const TWELVE_API_KEY = process.env.TWELVE_API_KEY;

  const TOTAL_SHARES = 99_950_000; // 總發行股數
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTO6ExFyN8r3JLHutCpoJFPKdLlFq2yTQxMm_Bf5a5jtYvRF51PfOBcVa2FCIVFEznTxhQKWZQgypyb/pub?gid=0&single=true&output=csv';

  try {
    // 取得 SBET 股價
    const sbetRes = await fetch(`https://api.twelvedata.com/quote?symbol=SBET&apikey=${TWELVE_API_KEY}`);
    const sbet = await sbetRes.json();
    const sbetPrice = parseFloat(sbet.close);
    const marketCap = sbetPrice * TOTAL_SHARES;

    // 取得 ETH 即時價格
    const ethRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const eth = await ethRes.json();
    const ethPrice = eth.ethereum.usd;


    // 取得 Google Sheets 上的 ETH 持有量（第 1 列第 2 欄）
    const csvRes = await fetch(SHEET_CSV_URL);
    const csvText = await csvRes.text();
    console.log('[csvText]', csvText);

    const lines = csvText.trim().split('\n');
    console.log('[lines]', lines);

    const row = lines[0].split(',');
    console.log('[row]', row);

    const rawValue = row[1];
    console.log('[rawValue]', rawValue);

    const ethAmount = parseFloat(rawValue);
 // 取第 2 欄（B1）


    // 計算 ETH 價值與 mNAV
    const ethValue = ethAmount * ethPrice;
    const mnav = ethValue / marketCap;

    res.status(200).json({
      price: sbetPrice.toFixed(4),
      market_cap: marketCap.toFixed(0),
      eth_price: ethPrice.toFixed(2),
      eth_amount: ethAmount.toFixed(4),
      mnav: mnav.toFixed(6)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
}

