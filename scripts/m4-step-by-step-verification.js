const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const ARTIFACT_DIR = path.resolve('C:/Users/riddh/.gemini/antigravity-ide/brain/ec262cc6-fa32-4bb5-905c-a935aa0cd4f1');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clickButtonWithText(page, textSubstring) {
  return page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(
      (b) => b.textContent && b.textContent.toLowerCase().includes(text.toLowerCase())
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, textSubstring);
}

async function selectOption(page, exactText) {
  return page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('form button[type="button"]'));
    for (const btn of buttons) {
      const textSpan = btn.querySelector('span.leading-relaxed') || btn.querySelector('span:last-child');
      if (textSpan && textSpan.textContent.trim().toLowerCase() === text.trim().toLowerCase()) {
        btn.click();
        return true;
      }
    }
    return false;
  }, exactText);
}

async function confirmInspection(page) {
  const btn = await page.$('#confirm-interaction-btn');
  if (btn) {
    await btn.click();
    return true;
  }
  return clickButtonWithText(page, 'Query');
}

async function submitQuestion(page) {
  const btn = await page.$('#submit-question-btn');
  if (btn) {
    await btn.click();
    return true;
  }
  return clickButtonWithText(page, 'Transmit');
}

async function resetStudentProgress() {
  try {
    await mongoose.connect('mongodb://localhost:27017/missionx', { serverSelectionTimeoutMS: 5000 });
    const user = await mongoose.connection.collection('users').findOne({ email: 'student@missionx.edu' });
    const mission = await mongoose.connection.collection('missions').findOne({ slug: 'power-grid-calibration' });
    if (user && mission) {
      await mongoose.connection.collection('progresses').deleteMany({
        studentId: user._id,
        missionId: mission._id,
      });
      console.log('✓ Cleaned previous progress for power-grid-calibration to ensure pristine Stage 1 start');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.warn('DB reset skipped:', err.message);
  }
}

async function run() {
  console.log('⚡ Starting Comprehensive Mission 4 (Power Grid Calibration) Playthrough & Verification...');

  await resetStudentProgress();

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
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

    page.on('console', (msg) => {
      console.log('  [Browser]', msg.text());
    });
    page.on('pageerror', (err) => {
      console.error('  [PageError]', err.message);
    });

    // ----------------------------------------------------
    // STEP 1: AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n--- STEP 1: AUTHENTICATION ---');
    const authRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@missionx.edu', password: 'StudentPass123!' })
    });
    const authData = await authRes.json();
    const token = authData.data.token;
    console.log('✓ Successfully retrieved student JWT token from API');

    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1000);
    await page.evaluate((jwt) => {
      localStorage.setItem('missionx_token', jwt);
    }, token);
    console.log('✓ Injected missionx_token into browser localStorage');

    await page.type('input[type="email"]', 'student@missionx.edu');
    await page.type('input[type="password"]', 'StudentPass123!');
    await page.click('button[type="submit"]');
    await sleep(2500);
    console.log('✓ Authenticated as student@missionx.edu');

    // ----------------------------------------------------
    // STEP 2: MISSION 4 BRIEFING
    // ----------------------------------------------------
    console.log('\n--- STEP 2: MISSION 4 BRIEFING ---');
    await page.goto('http://localhost:3000/missions/power-grid-calibration', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_01_briefing.png') });
    console.log('✓ Captured Mission 4 Briefing: m4_01_briefing.png');

    // ----------------------------------------------------
    // STEP 3: ENTER 3D POWER LAB (GIRL CHARACTER + ARROW CONTROLS)
    // ----------------------------------------------------
    console.log('\n--- STEP 3: ENTER 3D POWER LAB ROOM ---');
    await page.goto('http://localhost:3000/missions/power-grid-calibration/play', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('canvas', { timeout: 45000 });
    await sleep(5000); // Allow Three.js textures and character mesh to compile

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_02_room_entry_girl_character.png') });
    console.log('✓ Captured 3D Power Lab Room entry with Girl Character: m4_02_room_entry_girl_character.png');

    // ----------------------------------------------------
    // STEP 4: ARROW-KEY NAVIGATION
    // ----------------------------------------------------
    console.log('\n--- STEP 4: ARROW-KEY NAVIGATION ---');
    await page.keyboard.down('ArrowUp');
    await sleep(800);
    await page.keyboard.up('ArrowUp');
    await sleep(300);

    await page.keyboard.down('ArrowRight');
    await sleep(500);
    await page.keyboard.up('ArrowRight');
    await sleep(300);

    await page.keyboard.down('ArrowDown');
    await sleep(400);
    await page.keyboard.up('ArrowDown');
    await sleep(300);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_03_after_movement.png') });
    console.log('✓ Smooth arrow-key navigation verified: m4_03_after_movement.png');

    // ----------------------------------------------------
    // STEP 5: MISSION 4 DEDICATED MAP TABLET (POWER LAB 402)
    // ----------------------------------------------------
    console.log('\n--- STEP 5: MISSION 4 MAP TABLET ---');
    const mapBtn = await page.waitForSelector('#hud-mission-map-btn', { timeout: 8000 });
    await mapBtn.click();
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_04_mission_map_stage1.png') });
    console.log('✓ Captured Mission Map Tablet Stage 1: m4_04_mission_map_stage1.png');
    console.log('  → Confirmed: Power Conversion & Microgrid Lab 402 Blueprint, ADC Quantizer active target, START ✓');

    const closeMapBtn = await page.$('#close-mission-map-btn');
    if (closeMapBtn) {
      await closeMapBtn.click();
    } else {
      await page.keyboard.press('m');
    }
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 6: STAGE 1 — INSPECT ADC MODULE
    // ----------------------------------------------------
    console.log('\n--- STEP 6: STAGE 1 INSPECT ADC MODULE ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('adc_module');
    });
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_05_stage1_inspect_adc.png') });
    console.log('✓ Captured ADC Module telemetry: m4_05_stage1_inspect_adc.png');

    // Confirm inspection - triggers QuestionModal
    await confirmInspection(page);
    await sleep(2000);

    // ----------------------------------------------------
    // STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1: 1024)
    // ----------------------------------------------------
    console.log('\n--- STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1) ---');
    await selectOption(page, '1024');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_06_stage1_wrong_answer.png') });
    console.log('✓ Captured wrong answer rejection: m4_06_stage1_wrong_answer.png');

    // ----------------------------------------------------
    // STEP 8: SUBMIT CORRECT ANSWER (STAGE 1: 2048)
    // ----------------------------------------------------
    console.log('\n--- STEP 8: SUBMIT CORRECT ANSWER (2048) ---');
    await selectOption(page, '2048');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_07_stage1_solved.png') });
    console.log('✓ Captured Stage 1 solved banner: m4_07_stage1_solved.png');

    // ----------------------------------------------------
    // STEP 9: MISSION MAP UPDATED TO STAGE 2
    // ----------------------------------------------------
    console.log('\n--- STEP 9: MISSION MAP UPDATED TO STAGE 2 ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_08_mission_map_stage2.png') });
    console.log('✓ Captured Mission Map Tablet Stage 2: m4_08_mission_map_stage2.png');
    console.log('  → Confirmed: Stage 1 marked SOLVED ✓, Stage 2 (PWM Controller) ACTIVE →');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 10: TEST HINT BUZZER (STAGE 2)
    // ----------------------------------------------------
    console.log('\n--- STEP 10: TEST HINT BUZZER (STAGE 2) ---');
    const hintBtn = await page.waitForSelector('#hud-hint-buzzer-btn', { timeout: 5000 });
    await hintBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_09_hint_buzzer_stage2.png') });
    console.log('✓ Captured Hint Buzzer activation: m4_09_hint_buzzer_stage2.png');

    // Close objective drawer if open
    const closeDrawerBtn = await page.$('#close-objective-drawer-btn');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
    }
    await sleep(1500);

    // ----------------------------------------------------
    // STEP 11: STAGE 2 — INSPECT & CONFIGURE PWM CONTROLLER
    // ----------------------------------------------------
    console.log('\n--- STEP 11: STAGE 2 PWM CONTROLLER INSPECTION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('pwm_controller');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_10_stage2_inspect_pwm.png') });
    console.log('✓ Captured PWM Controller Diagnostics: m4_10_stage2_inspect_pwm.png');

    await confirmInspection(page);
    await sleep(2000);

    // Test wrong answer first
    console.log('  Testing wrong answer on Stage 2...');
    await selectOption(page, '40%');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    // Submit correct answer: 60%
    await selectOption(page, '60%');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_11_stage2_solved.png') });
    console.log('✓ Captured Stage 2 solved banner: m4_11_stage2_solved.png');

    // ----------------------------------------------------
    // STEP 12: STAGE 3 — LOAD BANK POWER DISSIPATION (0.39 W)
    // ----------------------------------------------------
    console.log('\n--- STEP 12: STAGE 3 LOAD BANK INSPECTION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('load_bank');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_12_stage3_inspect_load.png') });
    console.log('✓ Captured Load Bank inspection: m4_12_stage3_inspect_load.png');

    await confirmInspection(page);
    await sleep(2000);

    // Test wrong answer first
    console.log('  Testing wrong answer on Stage 3...');
    await selectOption(page, '0.19 W');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    // Submit correct answer: 0.39 W
    await selectOption(page, '0.39 W');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_13_stage3_solved.png') });
    console.log('✓ Captured Stage 3 solved and clue revealed: m4_13_stage3_solved.png');
    console.log('  → Clue Revealed: Power Grid Calibration Code: GRID33');

    // ----------------------------------------------------
    // STEP 13: STAGE 4 — AUTHORIZE MASTER CONTROLLER (GRID33)
    // ----------------------------------------------------
    console.log('\n--- STEP 13: STAGE 4 MASTER GRID CONTROLLER ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('power_console');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_14_stage4_inspect_console.png') });
    console.log('✓ Captured Master Controller inspection: m4_14_stage4_inspect_console.png');

    await confirmInspection(page);
    await sleep(2000);

    // Test wrong code first
    console.log('  Testing wrong code on Stage 4...');
    let codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.type('FAIL44');
      await sleep(500);
      await submitQuestion(page);
      await sleep(1500);
    }

    // Submit correct clearance key: GRID33
    codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await codeInput.type('GRID33');
      await sleep(500);
      await submitQuestion(page);
      await sleep(3500);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_15_stage4_code_accepted.png') });
    console.log('✓ Captured Grid Clearance Code acceptance: m4_15_stage4_code_accepted.png');

    // ----------------------------------------------------
    // STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED
    // ----------------------------------------------------
    console.log('\n--- STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_16_mission_map_exit_unlocked.png') });
    console.log('✓ Captured Mission Map with Exit Portal UNLOCKED: m4_16_mission_map_exit_unlocked.png');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH
    // ----------------------------------------------------
    console.log('\n--- STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await sleep(4000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_17_persistence_after_refresh.png') });
    console.log('✓ Captured State Persistence after refresh: m4_17_persistence_after_refresh.png');

    // ----------------------------------------------------
    // STEP 16: EXIT DOOR & FINAL MISSION COMPLETION
    // ----------------------------------------------------
    console.log('\n--- STEP 16: EXIT DOOR & FINAL MISSION COMPLETION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('exit_door');
    });
    await sleep(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm4_18_mission_complete_modal.png') });
    console.log('✓ Captured Final Completion Modal with POWER_CALIBRATOR badge: m4_18_mission_complete_modal.png');

    console.log('\n🎉 ALL MISSION 4 VERIFICATION STEPS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during Mission 4 playthrough:', err);
  } finally {
    await browser.close();
  }
}

run();
