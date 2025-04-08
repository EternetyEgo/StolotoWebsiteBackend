const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");

const router = express.Router();
const DATA_FILE = "data.json";

const urls = {
  "4-iz-20": "https://lotodata.ru/4-iz-20/?limit=5000",
  ohota: "https://lotodata.ru/ohota/?limit=5000",
  "5-iz-36": "https://lotodata.ru/5-iz-36/?limit=3000",
  "6-iz-45": "https://lotodata.ru/6-iz-45/?limit=5000",
  "7-iz-49": "https://lotodata.ru/7-iz-49/?limit=1000",
  zabava: "https://lotodata.ru/zabava/?limit=1000",
  rapido: "https://lotodata.ru/rapido/?limit=2000",
  rapido20: "https://lotodata.ru/rapido20/?limit=2000",
  "rapido-drive": "https://lotodata.ru/rapido-drive/?limit=2000",
  top3: "https://lotodata.ru/top3/?limit=5000",
  duel: "https://lotodata.ru/duel/?limit=1000",
  "6-iz-36": "https://lotodata.ru/6-iz-36/?limit=1000",
  "bolshoe-sportloto": "https://lotodata.ru/bolshoe-sportloto/?limit=3000",
  powerball: "https://lotodata.ru/powerball/?limit=200",
  eurojackpot: "https://lotodata.ru/eurojackpot/?limit=200",
  euromillions: "https://lotodata.ru/euromillions/?limit=200",
  megamillions: "https://lotodata.ru/megamillions/?limit=200",
  laprimitiva: "https://lotodata.ru/laprimitiva/?limit=200",
  "oz-lotto": "https://lotodata.ru/oz-lotto/?limit=200",
  uklotto: "https://lotodata.ru/uklotto/?limit=200",
  superenalotto: "https://lotodata.ru/superenalotto/?limit=200",
  bonoloto: "https://lotodata.ru/bonoloto/?limit=200",
};

// Ma'lumotlarni keshlash
let cachedData = {};

// JSON fayldan ma'lumotlarni yuklash
const loadCacheFromFile = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const rawData = fs.readFileSync(DATA_FILE);
      cachedData = JSON.parse(rawData);
      console.log("📂 Kesh fayldan yuklandi.");
    } catch (error) {
      console.error("❌ JSON faylni o‘qishda xatolik:", error);
    }
  }
};

// JSON faylga keshni saqlash
const saveCacheToFile = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedData, null, 2));
    console.log("✅ Kesh JSON faylga saqlandi.");
  } catch (error) {
    console.error("❌ JSON faylga yozishda xatolik:", error);
  }
};

// Sahifadan ma'lumot olish funksiyasi
const fetchLotteryData = async () => {
  console.log("♻️ Ma'lumotlar yangilanmoqda...");

  const browser = await puppeteer.launch({ headless: true });

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

  // JSON faylga saqlash
  saveCacheToFile();
};


// API endpoint: /api/lottery/names
router.get("/names", (req, res) => {
  return res.json({ names: Object.keys(urls) });
});

// API endpoint: /api/lottery/:name
router.get("/:name", async (req, res) => {
  const siteName = req.params.name;

  if (!urls[siteName]) {
    return res.status(404).json({ error: "Bunday lotereya topilmadi!" });
  }

  // Agar keshda bor bo‘lsa, shuni qaytar
  if (cachedData[siteName]) {
    return res.json(cachedData[siteName]);
  }

  res.status(500).json({ error: "Ma'lumotlar hali yangilanmagan!" });
});

// Har 30 daqiqada ma'lumotlarni yangilash (1800000ms)
setInterval(fetchLotteryData, 1800000);

// Server ishga tushganida JSON fayldan ma'lumotlarni yuklash
loadCacheFromFile();

module.exports = router;