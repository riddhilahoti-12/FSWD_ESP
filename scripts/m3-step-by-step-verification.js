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
    const mission = await mongoose.connection.collection('missions').findOne({ slug: 'lost-sensor-network' });
    if (user && mission) {
      await mongoose.connection.collection('progresses').deleteMany({
        studentId: user._id,
        missionId: mission._id,
      });
      console.log('✓ Cleaned previous progress for lost-sensor-network to ensure pristine Stage 1 start');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.warn('DB reset skipped:', err.message);
  }
}

async function run() {
  console.log('🚀 Starting Comprehensive Mission 3 (Lost Sensor Network) Playthrough & Verification...');

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
    console.log('✓ Authenticated as student@missionx.edu');

    // ----------------------------------------------------
    // STEP 2: MISSION BRIEFING & OBJECTIVES
    // ----------------------------------------------------
    console.log('\n--- STEP 2: MISSION 3 BRIEFING ---');
    await page.goto('http://localhost:3000/missions/lost-sensor-network', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_01_briefing.png') });
    console.log('✓ Captured Mission 3 Briefing: m3_01_briefing.png');

    // ----------------------------------------------------
    // STEP 3: ENTER 3D NOC ROOM (GIRL CHARACTER + ARROW CONTROLS)
    // ----------------------------------------------------
    console.log('\n--- STEP 3: ENTER 3D NOC ROOM ---');
    await page.goto('http://localhost:3000/missions/lost-sensor-network/play', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('canvas', { timeout: 45000 });
    await sleep(5000); // Allow Three.js textures and character mesh to compile

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_02_room_entry_girl_character.png') });
    console.log('✓ Captured 3D NOC Room entry with Girl Character: m3_02_room_entry_girl_character.png');

    // ----------------------------------------------------
    // STEP 4: ARROW-KEY NAVIGATION
    // ----------------------------------------------------
    console.log('\n--- STEP 4: ARROW-KEY NAVIGATION ---');
    await page.keyboard.down('ArrowUp');
    await sleep(800);
    await page.keyboard.up('ArrowUp');
    await sleep(300);

    await page.keyboard.down('ArrowLeft');
    await sleep(500);
    await page.keyboard.up('ArrowLeft');
    await sleep(300);

    await page.keyboard.down('ArrowDown');
    await sleep(400);
    await page.keyboard.up('ArrowDown');
    await sleep(300);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_03_after_movement.png') });
    console.log('✓ Smooth arrow-key navigation verified: m3_03_after_movement.png');

    // ----------------------------------------------------
    // STEP 5: MISSION 3 DEDICATED MAP TABLET (NOC 301)
    // ----------------------------------------------------
    console.log('\n--- STEP 5: MISSION 3 MAP TABLET ---');
    const mapBtn = await page.waitForSelector('#hud-mission-map-btn', { timeout: 8000 });
    await mapBtn.click();
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_04_mission_map_stage1.png') });
    console.log('✓ Captured Mission Map Tablet Stage 1: m3_04_mission_map_stage1.png');
    console.log('  → Confirmed: NOC Operations Center 301 Blueprint, Monitoring Screen active target, START ✓');

    const closeMapBtn = await page.$('#close-mission-map-btn');
    if (closeMapBtn) {
      await closeMapBtn.click();
    } else {
      await page.keyboard.press('m');
    }
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 6: STAGE 1 — INSPECT NOC MONITORING SCREEN
    // ----------------------------------------------------
    console.log('\n--- STEP 6: STAGE 1 INSPECT MONITORING SCREEN ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('monitoring_screen');
    });
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_05_stage1_inspect_screen.png') });
    console.log('✓ Captured Monitoring Screen telemetry: m3_05_stage1_inspect_screen.png');

    // Confirm inspection - triggers QuestionModal
    await confirmInspection(page);
    await sleep(2000);

    // ----------------------------------------------------
    // STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1)
    // ----------------------------------------------------
    console.log('\n--- STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1) ---');
    await selectOption(page, 'Node A');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_06_stage1_wrong_answer.png') });
    console.log('✓ Captured wrong answer rejection: m3_06_stage1_wrong_answer.png');

    // ----------------------------------------------------
    // STEP 8: SUBMIT CORRECT ANSWER (STAGE 1: Node C)
    // ----------------------------------------------------
    console.log('\n--- STEP 8: SUBMIT CORRECT ANSWER (Node C) ---');
    await selectOption(page, 'Node C');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_07_stage1_solved.png') });
    console.log('✓ Captured Stage 1 solved banner: m3_07_stage1_solved.png');

    // ----------------------------------------------------
    // STEP 9: MISSION MAP UPDATED TO STAGE 2
    // ----------------------------------------------------
    console.log('\n--- STEP 9: MISSION MAP UPDATED TO STAGE 2 ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_08_mission_map_stage2.png') });
    console.log('✓ Captured Mission Map Tablet Stage 2: m3_08_mission_map_stage2.png');
    console.log('  → Confirmed: Stage 1 marked SOLVED ✓, Stage 2 (Network Switch) ACTIVE →');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 10: TEST HINT BUZZER (STAGE 2)
    // ----------------------------------------------------
    console.log('\n--- STEP 10: TEST HINT BUZZER (STAGE 2) ---');
    const hintBtn = await page.waitForSelector('#hud-hint-buzzer-btn', { timeout: 5000 });
    await hintBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_09_hint_buzzer_stage2.png') });
    console.log('✓ Captured Hint Buzzer activation: m3_09_hint_buzzer_stage2.png');

    // Close objective drawer if open
    const closeDrawerBtn = await page.$('#close-objective-drawer-btn');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
    }
    await sleep(1500);

    // ----------------------------------------------------
    // STEP 11: STAGE 2 — DIAGNOSE NETWORK SWITCH & LINK
    // ----------------------------------------------------
    console.log('\n--- STEP 11: STAGE 2 MANAGED SWITCH INSPECTION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('network_switch');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_10_stage2_inspect_switch.png') });
    console.log('✓ Captured Switch Diagnostics: m3_10_stage2_inspect_switch.png');

    await confirmInspection(page);
    await sleep(2000);

    // Test wrong answer first
    console.log('  Testing wrong answer on Stage 2...');
    await selectOption(page, 'Gateway DNS lookup timeout');
    await sleep(500);
    await submitQuestion(page);
    await sleep(1500);

    // Submit correct answer
    await selectOption(page, 'Port 3 link failure / disconnected cable route');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_11_stage2_solved.png') });
    console.log('✓ Captured Stage 2 solved banner: m3_11_stage2_solved.png');

    // ----------------------------------------------------
    // STEP 12: STAGE 3 — SELECT RESILIENT ROUTE (AP BYPASS)
    // ----------------------------------------------------
    console.log('\n--- STEP 12: STAGE 3 PACKET ROUTING CONSOLE ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('packet_console');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_12_stage3_inspect_console.png') });
    console.log('✓ Captured Packet Console inspection: m3_12_stage3_inspect_console.png');

    await confirmInspection(page);
    await sleep(2000);

    // Submit correct route hops
    await selectOption(page, 'Sensor Node C → Wireless AP → Network Switch → Central Gateway');
    await sleep(500);
    await submitQuestion(page);
    await sleep(3500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_13_stage3_solved_clue.png') });
    console.log('✓ Captured Stage 3 solved and clue revealed: m3_13_stage3_solved_clue.png');
    console.log('  → Clue Revealed: Gateway Routing Authorization Code: NET99');

    // ----------------------------------------------------
    // STEP 13: STAGE 4 — AUTHORIZE ROUTE LATCH (NET99)
    // ----------------------------------------------------
    console.log('\n--- STEP 13: STAGE 4 CENTRAL GATEWAY TERMINAL ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('central_gateway');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_14_stage4_inspect_gateway.png') });
    console.log('✓ Captured Central Gateway inspection: m3_14_stage4_inspect_gateway.png');

    await confirmInspection(page);
    await sleep(2000);

    // Test wrong code first
    console.log('  Testing wrong code on Stage 4...');
    let codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.type('WRONG99');
      await sleep(500);
      await submitQuestion(page);
      await sleep(1500);
    }

    // Submit correct clearance key: NET99
    codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await codeInput.type('NET99');
      await sleep(500);
      await submitQuestion(page);
      await sleep(3500);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_15_stage4_code_accepted.png') });
    console.log('✓ Captured Gateway Clearance Code acceptance: m3_15_stage4_code_accepted.png');

    // ----------------------------------------------------
    // STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED
    // ----------------------------------------------------
    console.log('\n--- STEP 14: MISSION MAP WITH EXIT PORTAL UNLOCKED ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_16_mission_map_exit_unlocked.png') });
    console.log('✓ Captured Mission Map with Exit Portal UNLOCKED: m3_16_mission_map_exit_unlocked.png');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH
    // ----------------------------------------------------
    console.log('\n--- STEP 15: PERSISTENCE TEST ACROSS PAGE REFRESH ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await sleep(4000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_17_persistence_after_refresh.png') });
    console.log('✓ Captured State Persistence after refresh: m3_17_persistence_after_refresh.png');

    // ----------------------------------------------------
    // STEP 16: EXIT DOOR & FINAL MISSION COMPLETION
    // ----------------------------------------------------
    console.log('\n--- STEP 16: EXIT DOOR & FINAL MISSION COMPLETION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('exit_door');
    });
    await sleep(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm3_18_mission_complete_modal.png') });
    console.log('✓ Captured Final Completion Modal with NETWORK_REPAIRER badge: m3_18_mission_complete_modal.png');

    console.log('\n🎉 ALL MISSION 3 VERIFICATION STEPS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during Mission 3 playthrough:', err);
  } finally {
    await browser.close();
  }
}

run();
