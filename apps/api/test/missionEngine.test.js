const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(b) });
          } catch {
            resolve({ status: res.statusCode || 500, body: b });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(b) });
          } catch {
            resolve({ status: res.statusCode || 500, body: b });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED ASSERTION: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 2 MISSION ENGINE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  // 1. Authenticate two distinct students
  console.log('Step 1: Registering Student A and Student B...');
  const studentAEmail = `student_a_${Date.now()}@missionx.edu`;
  const studentBEmail = `student_b_${Date.now()}@missionx.edu`;

  const regA = await post('/api/auth/register', {
    name: 'Cadet Alice',
    email: studentAEmail,
    password: 'Password123!',
  });
  assert(regA.status === 201, 'Student A registered successfully');
  const tokenA = regA.body.data.token;

  const regB = await post('/api/auth/register', {
    name: 'Cadet Bob',
    email: studentBEmail,
    password: 'Password123!',
  });
  assert(regB.status === 201, 'Student B registered successfully');
  const tokenB = regB.body.data.token;

  const missionSlug = 'rescue-the-server-room';

  // 2. Student A starts mission
  console.log('\nStep 2: Starting mission for Student A...');
  const startA = await get(`/api/missions/${missionSlug}/state`, tokenA);
  assert(startA.status === 200, 'Student A initialized mission state');
  assert(startA.body.data.currentStage === 1, 'Mission begins at Stage 1');
  assert(startA.body.data.score === 0, 'Initial score is 0');
  assert(!startA.body.data.isExitUnlocked, 'Exit door is initially locked');

  // 3. Valid Interaction (Inspection)
  console.log('\nStep 3: Performing valid inspection on temperature_sensor...');
  const inspectRes = await post(
    `/api/missions/${missionSlug}/interactions/inspect-temp-sensor`,
    {},
    tokenA
  );
  assert(inspectRes.status === 200, 'Inspection interaction succeeded');
  assert(inspectRes.body.data.result.success === true, 'Inspection result is success');
  assert(
    inspectRes.body.data.missionState.completedInteractions.includes('inspect-temp-sensor'),
    'Completed interactions recorded inspect-temp-sensor'
  );

  // 4. Invalid Interaction (Non-existent)
  console.log('\nStep 4: Testing non-existent interaction rejection...');
  const invalidRes = await post(
    `/api/missions/${missionSlug}/interactions/non-existent-interaction-xyz`,
    {},
    tokenA
  );
  assert(invalidRes.status === 400, 'Non-existent interaction rejected with HTTP 400');

  // 5. Interaction from a future locked stage
  console.log('\nStep 5: Testing interaction from a locked stage rejection...');
  const lockedStageRes = await post(
    `/api/missions/${missionSlug}/interactions/q4-cooling-restart-interaction`,
    { payload: { code: '4180' } },
    tokenA
  );
  assert(lockedStageRes.status === 400, 'Future stage interaction rejected with HTTP 400');

  // 6. Security Check: Client tampering with score
  console.log('\nStep 6: Security test - Client attempting score/stage payload tampering...');
  const tamperRes = await post(
    `/api/missions/${missionSlug}/interactions/inspect-humidity-sensor`,
    { payload: { score: 999999, currentStage: 4, status: 'COMPLETED' } },
    tokenA
  );
  assert(tamperRes.status === 200, 'Inspection processed');
  assert(tamperRes.body.data.missionState.score === 0, 'Score manipulation rejected (still 0)');
  assert(tamperRes.body.data.missionState.currentStage === 1, 'Stage skip rejected (still 1)');

  // 7. Question Answer Validation - Incorrect Answer
  console.log('\nStep 7: Testing incorrect answer submission...');
  const wrongAnsRes = await post(
    `/api/missions/${missionSlug}/interactions/q1-temp-safe-interaction`,
    { payload: { answer: 'Yes - Conditions are nominal and within safe operational limits' } },
    tokenA
  );
  assert(wrongAnsRes.status === 200, 'Answer endpoint responded');
  assert(wrongAnsRes.body.data.result.isCorrect === false, 'Server rejected incorrect answer');
  assert(wrongAnsRes.body.data.missionState.attempts > 1, 'Attempts counter incremented');
  assert(wrongAnsRes.body.data.missionState.score === 0, 'Score not granted for incorrect answer');

  // 8. Hint Usage & Penalty Application
  console.log('\nStep 8: Testing hint unlock and penalty application...');
  const hintRes = await post(
    `/api/missions/${missionSlug}/hints/hint-stage-1/use`,
    {},
    tokenA
  );
  assert(hintRes.status === 200, 'Hint unlocked successfully');
  assert(hintRes.body.data.hint.text.length > 0, 'Hint text revealed');
  assert(hintRes.body.data.missionState.hintsUsed === 1, 'hintsUsed incremented');

  // 9. Question Answer Validation - Correct Answer & Stage 1 Completion
  console.log('\nStep 9: Submitting correct answer for Stage 1...');
  const correctAnsRes = await post(
    `/api/missions/${missionSlug}/interactions/q1-temp-safe-interaction`,
    { payload: { answer: 'No - Server room is overheating above the 28.0°C safe threshold' } },
    tokenA
  );
  assert(correctAnsRes.status === 200, 'Stage 1 correct answer submitted');
  assert(correctAnsRes.body.data.result.isCorrect === true, 'Server verified correct answer');
  assert(correctAnsRes.body.data.result.stageCompleted === true, 'Stage 1 marked completed');
  assert(correctAnsRes.body.data.missionState.currentStage === 2, 'Stage advanced to Stage 2');
  assert(correctAnsRes.body.data.missionState.score > 0, 'Score awarded for Stage 1');
  assert(
    correctAnsRes.body.data.missionState.unlockedObjects.includes('cooling_fan'),
    'Stage 2 objects (cooling_fan) unlocked'
  );

  // 10. Solve Stage 2
  console.log('\nStep 10: Solving Stage 2...');
  const stage2Ans = await post(
    `/api/missions/${missionSlug}/interactions/q2-cooling-diagnosis-interaction`,
    {
      payload: {
        answer: 'Inspect cooling ductwork and check for coolant leaks or condensation hazards',
      },
    },
    tokenA
  );
  assert(stage2Ans.body.data.result.isCorrect === true, 'Stage 2 correct answer verified');
  assert(stage2Ans.body.data.missionState.currentStage === 3, 'Advanced to Stage 3');
  assert(
    stage2Ans.body.data.missionState.unlockedObjects.includes('water_sensor'),
    'Stage 3 objects (water_sensor) unlocked'
  );

  // 11. Solve Stage 3
  console.log('\nStep 11: Solving Stage 3...');
  const stage3Ans = await post(
    `/api/missions/${missionSlug}/interactions/q3-water-safety-interaction`,
    {
      payload: {
        answer: 'Yes - Drainage is clear with no water hazard detected; proceed to breaker override',
      },
    },
    tokenA
  );
  assert(stage3Ans.body.data.result.isCorrect === true, 'Stage 3 correct answer verified');
  assert(stage3Ans.body.data.missionState.currentStage === 4, 'Advanced to Stage 4');
  assert(
    stage3Ans.body.data.missionState.revealedClues.length > 0,
    'Breaker authorization code clue revealed'
  );
  assert(
    stage3Ans.body.data.missionState.unlockedObjects.includes('control_panel'),
    'Control panel unlocked for Stage 4'
  );

  // 12. Solve Final Stage 4 (Code submission & Mission Completion)
  console.log('\nStep 12: Submitting 4-digit breaker clearance code for Stage 4...');
  const stage4Ans = await post(
    `/api/missions/${missionSlug}/interactions/q4-cooling-restart-interaction`,
    { payload: { code: '4180' } },
    tokenA
  );
  assert(stage4Ans.body.data.result.isCorrect === true, 'Breaker code verified server-side');
  assert(stage4Ans.body.data.result.missionCompleted === true, 'Mission marked completed');
  assert(stage4Ans.body.data.missionState.status === 'COMPLETED', 'Progress status is COMPLETED');
  assert(
    stage4Ans.body.data.missionState.unlockedObjects.includes('exit_door'),
    'Exit door unlocked upon mission completion'
  );
  assert(stage4Ans.body.data.missionState.isExitUnlocked === true, 'isExitUnlocked is TRUE');

  // 13. Isolation Test: Student B cannot see or modify Student A's state
  console.log('\nStep 13: Student Isolation Security Test...');
  const stateB = await get(`/api/missions/${missionSlug}/state`, tokenB);
  assert(stateB.body.data.currentStage === 1, 'Student B is independently at Stage 1');
  assert(stateB.body.data.score === 0, 'Student B score is 0');
  assert(stateB.body.data.status === 'IN_PROGRESS', 'Student B status is IN_PROGRESS');
  assert(!stateB.body.data.isExitUnlocked, 'Student B exit door is locked');

  console.log('\n====================================================');
  console.log('🎉 ALL 17 MISSION ENGINE ACCEPTANCE TESTS PASSED!');
  console.log('====================================================');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
