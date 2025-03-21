const express = require("express");
const puppeteer = require("puppeteer");

const router = express.Router();

const urls = {
  "4-iz-20": "https://lotodata.ru/4-iz-20/",
  ohota: "https://lotodata.ru/ohota/",
  "5-iz-36": "https://lotodata.ru/5-iz-36/",
  "6-iz-45": "https://lotodata.ru/6-iz-45/",
  "7-iz-49": "https://lotodata.ru/7-iz-49/",
  zabava: "https://lotodata.ru/zabava/",
  rapido: "https://lotodata.ru/rapido/",
  rapido20: "https://lotodata.ru/rapido20/",
  "rapido-drive": "https://lotodata.ru/rapido-drive/",
  top3: "https://lotodata.ru/top3/",
  duel: "https://lotodata.ru/duel/",
  "6-iz-36": "https://lotodata.ru/6-iz-36/",
  "bolshoe-sportloto": "https://lotodata.ru/bolshoe-sportloto/",
  powerball: "https://lotodata.ru/powerball/",
  eurojackpot: "https://lotodata.ru/eurojackpot/",
  euromillions: "https://lotodata.ru/euromillions/",
  megamillions: "https://lotodata.ru/megamillions/",
  laprimitiva: "https://lotodata.ru/laprimitiva/",
  "oz-lotto": "https://lotodata.ru/oz-lotto/",
  uklotto: "https://lotodata.ru/uklotto/",
  superenalotto: "https://lotodata.ru/superenalotto/",
  bonoloto: "https://lotodata.ru/bonoloto/",
};

// Ma'lumotlarni saqlash uchun kesh
let cachedData = {};

// Sahifadan ma'lumot olish funksiyasi
const fetchLotteryData = async () => {
  console.log("♻️ Ma'lumotlar yangilanmoqda...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // Agar bitta process kerak bo'lsa
      "--disable-gpu",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable",
  });

  for (const [name, url] of Object.entries(urls)) {
    try {
      const page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");

      console.log(`🔍 ${name} saytidan ma'lumot olinmoqda...`);
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const data = await page.evaluate(() => ({
        title: document.title.trim(),
        url: window.location.href,
        text: document.body.innerText.replace(/\s+/g, " ").trim(),
      }));

      cachedData[name] = {
        siteName: name,
        data,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ ${name} saytida xatolik:`, error);
    }
  }

  await browser.close();
  console.log("✅ Barcha ma'lumotlar yangilandi!");
};

// API endpoint: /api/lottery/:name
router.get("/:name", async (req, res) => {
  const siteName = req.params.name;

  if (!urls[siteName]) {
    return res.status(404).json({ error: "Bunday lotereya topilmadi!" });
  }

  // Keshda bor bo‘lsa, shuni qaytar
  if (cachedData[siteName]) {
    return res.json(cachedData[siteName]);
  }

  res.status(500).json({ error: "Ma'lumotlar hali yangilanmagan!" });
});

// Har 30 daqiqada yangilash (1800000ms)
setInterval(fetchLotteryData, 1800000);

// Server ishga tushganida birinchi marta ma'lumotni olish
fetchLotteryData();

module.exports = router;
