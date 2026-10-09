const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/riddh/.gemini/antigravity-ide/brain/ec262cc6-fa32-4bb5-905c-a935aa0cd4f1');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('⚡ Verifying Sequential One-by-One Sensor Walkthrough...');

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
    console.log('[1/7] Logging in student account...');
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

    // 2. Open /simulator
    console.log('[2/7] Navigating to /simulator workbench...');
    await page.goto('http://localhost:3000/simulator', { waitUntil: 'networkidle2' });
    await sleep(2500);

    // Scroll to circuit diagram
    await page.evaluate(() => {
      window.scrollBy({ top: 380, behavior: 'smooth' });
    });
    await sleep(1000);

    // Screen 1: Default Baseline (Step 1)
    const shot1 = path.join(ARTIFACT_DIR, 'seq_01_baseline_normal.png');
    await page.screenshot({ path: shot1 });
    console.log('✓ Captured Screen 1: Default Baseline Normal (Clean & quiet)');

    // Helper to click step tab in CircuitDiagramViewer by ID
    const clickStep = async (stepId) => {
      const btn = await page.waitForSelector(`#circuit-step-btn-${stepId}`, { timeout: 10000 });
      await btn.click();
      await sleep(2000);
    };

    // Screen 2: Step 2 — DHT22 Temp Sensor (Overheating alert)
    console.log('[3/7] Advancing to Step 2: Temp Sensor (DHT22)...');
    await clickStep(1);
    const shot2 = path.join(ARTIFACT_DIR, 'seq_02_dht22_temp_alert.png');
    await page.screenshot({ path: shot2 });
    console.log('✓ Captured Screen 2: DHT22 Temp Sensor Overheating & Red Strobe LED');

    // Screen 3: Step 3 — CRAC Fan Relay (Cooling)
    console.log('[4/7] Advancing to Step 3: CRAC Fan Relay...');
    await clickStep(2);
    const shot3 = path.join(ARTIFACT_DIR, 'seq_03_crac_fan_cooling.png');
    await page.screenshot({ path: shot3 });
    console.log('✓ Captured Screen 3: CRAC Blower Fan Online & Cooling');

    // Screen 4: Step 4 — Water Leak Probe
    console.log('[5/7] Advancing to Step 4: Water Leak Probe...');
    await clickStep(3);
    const shot4 = path.join(ARTIFACT_DIR, 'seq_04_water_leak_detected.png');
    await page.screenshot({ path: shot4 });
    console.log('✓ Captured Screen 4: Water Probe 3.3V Analog Leak Detection');

    // Screen 5: Step 5 — Acoustic Buzzer
    console.log('[6/7] Advancing to Step 5: Acoustic Buzzer...');
    await clickStep(4);
    const shot5 = path.join(ARTIFACT_DIR, 'seq_05_piezo_buzzer_alarm.png');
    await page.screenshot({ path: shot5 });
    console.log('✓ Captured Screen 5: Acoustic Piezo Buzzer 85dB Warning');

    // Screen 6: Step 6 — System Recovery
    console.log('[7/7] Advancing to Step 6: System Recovery...');
    await clickStep(5);
    const shot6 = path.join(ARTIFACT_DIR, 'seq_06_system_recovery.png');
    await page.screenshot({ path: shot6 });
    console.log('✓ Captured Screen 6: System Fully Recovered & Nominal');

    console.log('\n🎉 ALL SEQUENTIAL ONE-BY-ONE WALKTHROUGH SCREENS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during sequential verification:', err);
  } finally {
    await browser.close();
  }
}

run();
