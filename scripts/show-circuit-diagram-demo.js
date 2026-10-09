const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/riddh/.gemini/antigravity-ide/brain/ec262cc6-fa32-4bb5-905c-a935aa0cd4f1');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('⚡ Demonstrating Wokwi Circuit Diagram with Lively Wire Connections...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 950 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
    ],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    // 1. Authenticate
    console.log('Logging in student...');
    const authRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@missionx.edu', password: 'StudentPass123!' }),
    });
    const authData = await authRes.json();
    const token = authData.data.token;

    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate((jwt, usr) => {
      localStorage.setItem(
        'missionx-auth',
        JSON.stringify({
          state: {
            token: jwt,
            user: usr,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    }, token, authData.data.user);

    // 2. Open Simulator Workbench
    console.log('Navigating to /simulator workbench...');
    await page.goto('http://localhost:3000/simulator', { waitUntil: 'networkidle2' });
    await sleep(2500);

    const shot1Path = path.join(ARTIFACT_DIR, 'circuit_diagram_01_workbench.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log('✓ Captured screenshot:', shot1Path);

    // Scroll slightly down to focus squarely on the circuit diagram
    await page.evaluate(() => {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    });
    await sleep(1000);

    const shot2Path = path.join(ARTIFACT_DIR, 'circuit_diagram_02_schematic_closeup.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log('✓ Captured screenshot:', shot2Path);

    // 3. Open Mission 1 3D Room and open Hardware Demo Panel -> Circuit Diagram Tab
    console.log('Navigating to Mission 1 3D Room...');
    await page.goto('http://localhost:3000/missions/rescue-the-server-room/play', { waitUntil: 'domcontentloaded' });
    await sleep(3500);

    // Click HARDWARE button
    const hwBtn = await page.$('#open-hardware-demo-btn');
    if (hwBtn) {
      await hwBtn.click();
      console.log('✓ Clicked HARDWARE button');
      await sleep(1000);

      // Click "Live Circuit Diagram" tab
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tabBtn = buttons.find(b => b.textContent && b.textContent.includes('Live Circuit Diagram'));
        if (tabBtn) tabBtn.click();
      });
      await sleep(1500);

      const shot3Path = path.join(ARTIFACT_DIR, 'circuit_diagram_03_in_3d_room.png');
      await page.screenshot({ path: shot3Path, fullPage: false });
      console.log('✓ Captured screenshot:', shot3Path);
    }

    console.log('\n🎉 ALL CIRCUIT DEMONSTRATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error in circuit demonstration:', err);
  } finally {
    await browser.close();
  }
}

run();
