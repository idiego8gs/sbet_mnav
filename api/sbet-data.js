export default async function handler(req, res) {
  const TWELVE_API_KEY = process.env.TWELVE_API_KEY; // 在 Vercel 裡設定環境變數

  try {
    const [sbetRes, ethRes] = await Promise.all([
      fetch(`https://api.twelvedata.com/quote?symbol=SBET&apikey=${TWELVE_API_KEY}`),
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
    ]);

    const sbet = await sbetRes.json();
    const eth = await ethRes.json();

    const data = {
      market_cap: sbet.market_cap,
      eth_price: eth.ethereum.usd
    };

    res.setHeader('Cache-Control', 's-maxage=150'); // cache 2 分半，減少流量
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API 抓取錯誤" });
  }
}
