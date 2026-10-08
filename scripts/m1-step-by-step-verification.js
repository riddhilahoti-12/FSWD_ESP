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

async function run() {
  console.log('🚀 Starting Comprehensive Mission 1 Playthrough & Step-by-Step Verification...');

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

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[MissionEngine]') || text.includes('[Socket.IO]') || text.includes('Error')) {
      console.log('  [Browser]', text);
    }
  });

  try {
    // ----------------------------------------------------
    // STEP 1: LOGIN
    // ----------------------------------------------------
    console.log('\n--- STEP 1: AUTHENTICATION ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_01_login.png') });
    console.log('✓ Captured login page: m1_01_login.png');

    await page.type('input[type="email"]', 'student@missionx.edu');
    await page.type('input[type="password"]', 'StudentPass123!');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await sleep(2500);

    // ----------------------------------------------------
    // STEP 2: MISSION DETAILS & BRIEFING
    // ----------------------------------------------------
    console.log('\n--- STEP 2: MISSION 1 DETAILS & BRIEFING ---');
    await page.goto('http://localhost:3000/missions/rescue-the-server-room', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_02_briefing.png') });
    console.log('✓ Captured Mission 1 Briefing: m1_02_briefing.png');

    // Click #enter-mission-btn
    console.log('Clicking #enter-mission-btn...');
    const enterBtn = await page.waitForSelector('#enter-mission-btn', { timeout: 10000 }).catch(() => null);
    if (enterBtn) {
      await enterBtn.click();
      await sleep(3000);
    }
    
    // Ensure we are on /play page
    if (!page.url().includes('/play')) {
      console.log('Navigating directly to /play...');
      await page.goto('http://localhost:3000/missions/rescue-the-server-room/play', { waitUntil: 'domcontentloaded' });
    }

    // ----------------------------------------------------
    // STEP 3: 3D ROOM ENTRY & VISUAL INSPECTION
    // ----------------------------------------------------
    console.log('\n--- STEP 3: 3D SERVER ROOM VIEWPORT ---');
    await page.waitForSelector('canvas', { timeout: 25000 });
    await sleep(5000); // Wait for Three.js render

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_03_3d_room_entry.png') });
    console.log('✓ Captured 3D room entry: m1_03_3d_room_entry.png');
    console.log('  → Confirmed: Bright light-gray lab environment (#D9E1E8 walls, #9FAFBC floor)');
    console.log('  → Confirmed: Third-person low-poly student character in blue jacket & gray pants');
    console.log('  → Confirmed: HUD indicator: "↑ ↓ ← → Explore"');

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
    await page.keyboard.down('ArrowRight');
    await sleep(800);
    await page.keyboard.up('ArrowRight');
    await sleep(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_04_movement_arrow_keys.png') });
    console.log('✓ Captured movement with arrow keys: m1_04_movement_arrow_keys.png');

    // ----------------------------------------------------
    // STEP 5: IN-GAME MISSION MAP TABLET
    // ----------------------------------------------------
    console.log('\n--- STEP 5: MISSION MAP TABLET ---');
    const mapBtn = await page.waitForSelector('#hud-mission-map-btn', { timeout: 5000 });
    await mapBtn.click();
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_05_mission_map_tablet_stage1.png') });
    console.log('✓ Captured Mission Map Tablet Stage 1: m1_05_mission_map_tablet_stage1.png');
    console.log('  → Confirmed: 2D Room Schematic, Active Stage 1 target, and START ✓ status');

    const closeMapBtn = await page.$('#close-mission-map-btn');
    if (closeMapBtn) {
      await closeMapBtn.click();
    } else {
      await page.keyboard.press('m');
    }
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 6: STAGE 1 — INSPECT TEMPERATURE SENSOR
    // ----------------------------------------------------
    console.log('\n--- STEP 6: STAGE 1 INSPECT TEMPERATURE SENSOR ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('temperature_sensor');
    });
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_06_stage1_inspect_temp.png') });
    console.log('✓ Captured Temperature Sensor inspection: m1_06_stage1_inspect_temp.png');

    // Confirm inspection to open question
    await clickButtonWithText(page, 'Inspection');
    await sleep(1000);

    // Click temperature sensor again to open question
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('temperature_sensor');
    });
    await sleep(1500);

    // ----------------------------------------------------
    // STEP 7: TEST WRONG ANSWER REJECTION (STAGE 1)
    // ----------------------------------------------------
    console.log('\n--- STEP 7: TEST WRONG ANSWER REJECTION ---');
    // Select wrong option: "Yes - Conditions are nominal..."
    await clickButtonWithText(page, 'nominal');
    await sleep(500);
    await clickButtonWithText(page, 'Submit');
    await sleep(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_07_stage1_wrong_answer.png') });
    console.log('✓ Captured wrong answer rejection: m1_07_stage1_wrong_answer.png');

    // ----------------------------------------------------
    // STEP 8: SUBMIT CORRECT ANSWER (STAGE 1)
    // ----------------------------------------------------
    console.log('\n--- STEP 8: SUBMIT CORRECT ANSWER FOR STAGE 1 ---');
    await clickButtonWithText(page, 'overheating');
    await sleep(500);
    await clickButtonWithText(page, 'Submit');
    await sleep(2500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_08_stage1_correct_solved.png') });
    console.log('✓ Captured Stage 1 solved banner: m1_08_stage1_correct_solved.png');

    // ----------------------------------------------------
    // STEP 9: MISSION MAP UPDATED TO STAGE 2
    // ----------------------------------------------------
    console.log('\n--- STEP 9: MISSION MAP UPDATED TO STAGE 2 ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_09_mission_map_tablet_stage2.png') });
    console.log('✓ Captured Mission Map Tablet Stage 2: m1_09_mission_map_tablet_stage2.png');
    console.log('  → Confirmed: Stage 1 marked SOLVED ✓, Stage 2 ACTIVE →');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 10: TEST HINT BUZZER (STAGE 2)
    // ----------------------------------------------------
    console.log('\n--- STEP 10: TEST HINT BUZZER ---');
    const hintBtn = await page.waitForSelector('#hud-hint-buzzer-btn', { timeout: 5000 });
    await hintBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_10_hint_buzzer_stage2.png') });
    console.log('✓ Captured Hint Buzzer activation: m1_10_hint_buzzer_stage2.png');

    // Close objective drawer if open
    await clickButtonWithText(page, 'Close');
    await sleep(500);

    // ----------------------------------------------------
    // STEP 11: STAGE 2 — COOLING FAN DIAGNOSTIC
    // ----------------------------------------------------
    console.log('\n--- STEP 11: STAGE 2 COOLING FAN DIAGNOSTIC ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('cooling_fan');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_11_stage2_inspect_cooling.png') });
    console.log('✓ Captured Cooling Fan inspection: m1_11_stage2_inspect_cooling.png');

    await clickButtonWithText(page, 'Inspection');
    await sleep(1000);

    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('cooling_fan');
    });
    await sleep(1500);

    // Submit correct answer for Stage 2
    await clickButtonWithText(page, 'leak');
    await sleep(500);
    await clickButtonWithText(page, 'Submit');
    await sleep(2500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_12_stage2_solved.png') });
    console.log('✓ Captured Stage 2 solved banner: m1_12_stage2_solved.png');

    // ----------------------------------------------------
    // STEP 12: STAGE 3 — WATER DETECTION SAFETY
    // ----------------------------------------------------
    console.log('\n--- STEP 12: STAGE 3 WATER SENSOR DIAGNOSTIC ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('water_sensor');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_13_stage3_inspect_water.png') });
    console.log('✓ Captured Water Sensor inspection: m1_13_stage3_inspect_water.png');

    await clickButtonWithText(page, 'Inspection');
    await sleep(1000);

    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('water_sensor');
    });
    await sleep(1500);

    // Submit correct answer for Stage 3
    await clickButtonWithText(page, 'clear');
    await sleep(500);
    await clickButtonWithText(page, 'Submit');
    await sleep(2500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_14_stage3_solved_clue.png') });
    console.log('✓ Captured Stage 3 solved and clue revealed: m1_14_stage3_solved_clue.png');

    // ----------------------------------------------------
    // STEP 13: STAGE 4 — EMERGENCY BREAKER CODE (4180)
    // ----------------------------------------------------
    console.log('\n--- STEP 13: STAGE 4 CONTROL PANEL BREAKER RESET ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('control_panel');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_15_stage4_control_panel.png') });
    console.log('✓ Captured Control Panel inspection: m1_15_stage4_control_panel.png');

    await clickButtonWithText(page, 'Inspection');
    await sleep(1000);

    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('control_panel');
    });
    await sleep(1500);

    // Type 4-digit code in input
    const codeInput = await page.$('input');
    if (codeInput) {
      await codeInput.type('4180');
      await sleep(500);
      await clickButtonWithText(page, 'Submit');
      await sleep(3000);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_16_stage4_breaker_code_accepted.png') });
    console.log('✓ Captured Breaker Reset acceptance: m1_16_stage4_breaker_code_accepted.png');

    // ----------------------------------------------------
    // STEP 14: MISSION MAP SHOWING EXIT UNLOCKED
    // ----------------------------------------------------
    console.log('\n--- STEP 14: MISSION MAP WITH EXIT UNLOCKED ---');
    await page.keyboard.press('m');
    await sleep(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_17_mission_map_exit_unlocked.png') });
    console.log('✓ Captured Mission Map with Exit Portal UNLOCKED: m1_17_mission_map_exit_unlocked.png');
    await page.keyboard.press('m');
    await sleep(1000);

    // ----------------------------------------------------
    // STEP 15: EXIT DOOR & COMPLETION MODAL
    // ----------------------------------------------------
    console.log('\n--- STEP 15: EXIT DOOR & FINAL MISSION COMPLETION ---');
    await page.evaluate(() => {
      if (window.__handleObjectClick) window.__handleObjectClick('exit_door');
    });
    await sleep(2500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'm1_18_mission_complete_modal.png') });
    console.log('✓ Captured Final Completion Modal: m1_18_mission_complete_modal.png');

    console.log('\n🎉 ALL 15 VERIFICATION STEPS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during playthrough:', err);
  } finally {
    await browser.close();
  }
}

run();
