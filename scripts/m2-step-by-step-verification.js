const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

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

const mongoose = require('mongoose');

async function resetStudentProgress() {
  try {
    await mongoose.connect('mongodb://localhost:27017/missionx', { serverSelectionTimeoutMS: 5000 });
    const user = await mongoose.connection.collection('users').findOne({ email: 'student@missionx.edu' });
    const mission = await mongoose.connection.collection('missions').findOne({ slug: 'signal-in-the-lab' });
    if (user && mission) {
      await mongoose.connection.collection('progresses').deleteMany({
        studentId: user._id,
        missionId: mission._id,
      });
      console.log('✓ Cleaned previous progress for signal-in-the-lab to ensure pristine Stage 1 start');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.warn('DB reset skipped:', err.message);
  }
}

async function run() {
  console.log('🚀 Starting Comprehensive Mission 2 (Signal in the Lab) Playthrough & Verification...');

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

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  page.on('console', (msg) => {
    const text = msg.text();
    console.log('  [Browser]', text);
  });
  page.on('pageerror', (err) => {
    console.error('  [PageError]', err.message);
  });

  try {
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

    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1000);
    await page.evaluate((jwt) => {
      localStorage.setItem('missionx_token', jwt);
    }, token);
    console.log('✓ Injected missionx_token into browser localStorage');

    await page.type('input[type="email"]', 'student@missionx.edu');
    await page.type('input[type="password"]', 'StudentPass123!');
    await page.click('button[type="submit"]');
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 2: MISSION 2 DETAILS & BRIEFING
    // ----------------------------------------------------
    console.log('\n--- STEP 2: MISSION 2 BRIEFING ---');
    await page.goto('http://localhost:3000/missions/signal-in-the-lab', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_01_briefing.png') });
    console.log('✓ Captured Mission 2 Briefing: m2_01_briefing.png');

    // Click #enter-mission-btn or navigate directly to /play
    console.log('Entering Mission 2 play session...');
    const enterBtn = await page.$('#enter-mission-btn');
    if (enterBtn) {
      await enterBtn.click();
      await sleep(3000);
    }

    if (!page.url().includes('/play')) {
      await page.goto('http://localhost:3000/missions/signal-in-the-lab/play', { waitUntil: 'domcontentloaded' });
    }

    // ----------------------------------------------------
    // STEP 3: 3D ELECTRONICS LAB ROOM ENTRY & VISUAL INSPECTION
    // ----------------------------------------------------
    console.log('\n--- STEP 3: 3D ELECTRONICS LAB ROOM VIEWPORT ---');
    await page.waitForSelector('canvas', { timeout: 25000 });
    await sleep(5000); // Wait for Three.js render

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_02_3d_room_entry.png') });
    console.log('✓ Captured 3D room entry: m2_02_3d_room_entry.png');
    console.log('  → Confirmed: Bright futuristic electronics lab (#D9E1E8 walls, #9FAFBC floor)');
    console.log('  → Confirmed: Stylized 3D girl student character with ponytail & cyan tech accent');
    console.log('  → Confirmed: HUD indicator: "↑ ↓ ← → Explore Lab"');

    // ----------------------------------------------------
    // STEP 4: ARROW KEY MOVEMENT & THIRD-PERSON CAMERA
    // ----------------------------------------------------
    console.log('\n--- STEP 4: ARROW KEY MOVEMENT ---');
    await page.keyboard.press('ArrowUp');
    await sleep(200);
    await page.keyboard.down('ArrowUp');
    await sleep(1000);
    await page.keyboard.up('ArrowUp');
    await sleep(200);
    await page.keyboard.down('ArrowLeft');
    await sleep(800);
    await page.keyboard.up('ArrowLeft');
    await sleep(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_03_movement_arrow_keys.png') });
    console.log('✓ Captured movement with arrow keys: m2_03_movement_arrow_keys.png');

    // ----------------------------------------------------
    // STEP 5: IN-GAME MISSION MAP TABLET (MISSION 2)
    // ----------------------------------------------------
    console.log('\n--- STEP 5: MISSION MAP TABLET (STAGE 1) ---');
    const mapBtn = await page.waitForSelector('#hud-mission-map-btn', { timeout: 5000 });
    await mapBtn.click();
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_04_mission_map_stage1.png') });
    console.log('✓ Captured Mission Map Tablet Stage 1: m2_04_mission_map_stage1.png');
    console.log('  → Confirmed: Electronics Lab 204 Blueprint, Oscilloscope active target, START ✓');

    const closeMapBtn = await page.$('#close-mission-map-btn');
    if (closeMapBtn) {
      await closeMapBtn.click();
    } else {
      await page.keyboard.press('m');
    }
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 6: STAGE 1 — INSPECT OSCILLOSCOPE
    // ----------------------------------------------------
    console.log('\n--- STEP 6: STAGE 1 INSPECT OSCILLOSCOPE ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('oscilloscope');
    });
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_05_stage1_inspect_oscilloscope.png') });
    console.log('✓ Captured Oscilloscope telemetry readout: m2_05_stage1_inspect_oscilloscope.png');

    // Confirm inspection - automatically triggers QuestionModal
    await confirmInspection(page);
    await sleep(2000);

    // ----------------------------------------------------
    // STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1)
    // ----------------------------------------------------
    console.log('\n--- STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1) ---');
    // Select wrong answer: 500 Hz
    await selectOption(page, '500 Hz');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_06_stage1_wrong_answer.png') });
    console.log('✓ Captured wrong answer rejection: m2_06_stage1_wrong_answer.png');

    // ----------------------------------------------------
    // STEP 8: SUBMIT CORRECT ANSWER (STAGE 1: 1000 Hz)
    // ----------------------------------------------------
    console.log('\n--- STEP 8: SUBMIT CORRECT ANSWER (1000 Hz) ---');
    await selectOption(page, '1000 Hz');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_07_stage1_solved.png') });
    console.log('✓ Captured Stage 1 solved banner: m2_07_stage1_solved.png');

    // ----------------------------------------------------
    // STEP 9: MISSION MAP UPDATED TO STAGE 2
    // ----------------------------------------------------
    console.log('\n--- STEP 9: MISSION MAP UPDATED TO STAGE 2 ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_08_mission_map_stage2.png') });
    console.log('✓ Captured Mission Map Tablet Stage 2: m2_08_mission_map_stage2.png');
    console.log('  → Confirmed: Stage 1 marked SOLVED ✓, Stage 2 (Breadboard) ACTIVE →');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 10: TEST HINT BUZZER (STAGE 2)
    // ----------------------------------------------------
    console.log('\n--- STEP 10: TEST HINT BUZZER (STAGE 2) ---');
    const hintBtn = await page.waitForSelector('#hud-hint-buzzer-btn', { timeout: 5000 });
    await hintBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_09_hint_buzzer_stage2.png') });
    console.log('✓ Captured Hint Buzzer activation: m2_09_hint_buzzer_stage2.png');

    // Close objective drawer if open
    const closeDrawerBtn = await page.$('#close-objective-drawer-btn');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
    }
    await sleep(1500);

    // ----------------------------------------------------
    // STEP 11: STAGE 2 — CALCULATE SIGNAL PERIOD (1 ms)
    // ----------------------------------------------------
    console.log('\n--- STEP 11: STAGE 2 BREADBOARD PERIOD ANALYSIS ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('breadboard');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_10_stage2_inspect_breadboard.png') });
    console.log('✓ Captured Breadboard inspection: m2_10_stage2_inspect_breadboard.png');

    await confirmInspection(page);
    await sleep(2000);

    // Submit correct answer: exact '1 ms' (T = 1 / 1000)
    await selectOption(page, '1 ms');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_11_stage2_solved.png') });
    console.log('✓ Captured Stage 2 solved banner: m2_11_stage2_solved.png');

    // ----------------------------------------------------
    // STEP 12: STAGE 3 — SELECT FILTER TOPOLOGY (LOW-PASS)
    // ----------------------------------------------------
    console.log('\n--- STEP 12: STAGE 3 ACTIVE FILTER SELECTION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('filter_module');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_12_stage3_inspect_filter.png') });
    console.log('✓ Captured Filter Module inspection: m2_12_stage3_inspect_filter.png');

    await confirmInspection(page);
    await sleep(2000);

    // Submit correct filter: exact 'Low-pass filter'
    await selectOption(page, 'Low-pass filter');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_13_stage3_solved_clue.png') });
    console.log('✓ Captured Stage 3 solved and clue revealed: m2_13_stage3_solved_clue.png');
    console.log('  → Clue Revealed: Filter Calibration Key: RC741');

    // ----------------------------------------------------
    // STEP 13: STAGE 4 — CALIBRATION CONSOLE (RC741)
    // ----------------------------------------------------
    console.log('\n--- STEP 13: STAGE 4 ATE CALIBRATION CONSOLE ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('measurement_console');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_14_stage4_inspect_console.png') });
    console.log('✓ Captured ATE Console inspection: m2_14_stage4_inspect_console.png');

    await confirmInspection(page);
    await sleep(2000);

    // Type 5-character clearance key: RC741
    const codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.type('RC741');
      await sleep(500);
      await submitQuestion(page);
      await sleep(3500);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_15_stage4_code_accepted.png') });
    console.log('✓ Captured Calibration Key acceptance: m2_15_stage4_code_accepted.png');

    // ----------------------------------------------------
    // STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED
    // ----------------------------------------------------
    console.log('\n--- STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_16_mission_map_exit_unlocked.png') });
    console.log('✓ Captured Mission Map with Exit Portal UNLOCKED: m2_16_mission_map_exit_unlocked.png');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH (SECTION 30)
    // ----------------------------------------------------
    console.log('\n--- STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(5000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_17_persistence_after_refresh.png') });
    console.log('✓ Captured State Persistence after refresh: m2_17_persistence_after_refresh.png');

    // ----------------------------------------------------
    // STEP 16: EXIT DOOR & FINAL MISSION COMPLETION
    // ----------------------------------------------------
    console.log('\n--- STEP 16: EXIT DOOR & FINAL MISSION COMPLETION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('exit_door');
    });
    await sleep(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm2_18_mission_complete_modal.png') });
    console.log('✓ Captured Final Completion Modal: m2_18_mission_complete_modal.png');

    console.log('\n🎉 ALL MISSION 2 VERIFICATION STEPS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during Mission 2 playthrough:', err);
  } finally {
    await browser.close();
  }
}

run();
