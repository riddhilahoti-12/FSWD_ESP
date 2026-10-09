const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
    }
  });

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
  await new Promise(r => setTimeout(r, 6000));

  const hasCanvas = await page.$('canvas');
  console.log('HAS CANVAS:', Boolean(hasCanvas));
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('BODY TEXT:', bodyText);

  await browser.close();
}

run();
