const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/riddh/.gemini/antigravity-ide/brain/ec262cc6-fa32-4bb5-905c-a935aa0cd4f1');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'student@missionx.edu');
  await page.type('input[type="password"]', 'StudentPass123!');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:3000/missions/lost-sensor-network/play', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'debug_m3_canvas_screen.png') });
  console.log('Saved debug_m3_canvas_screen.png');

  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE BODY TEXT:\n', text);

  await browser.close();
}

run();
