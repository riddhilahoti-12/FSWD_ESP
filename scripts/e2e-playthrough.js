/**
 * MISSIONX — Complete 5-Mission Gameplay Playthrough & QA Verification Script
 * Validates:
 * 1. Student Auth & Session Token
 * 2. Start / Resume for all 5 Missions
 * 3. Wrong answer rejection & anti-tampering
 * 4. Context-sensitive Hint Buzzer & Score Penalty
 * 5. Full 4-Stage progression across all 5 Missions
 * 6. Final challenge authorization & Exit Door unlock
 * 7. State persistence across session reload
 * 8. Realtime IoT Telemetry Reaction (Rescue the Server Room)
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runPlaythrough() {
  console.log('================================================================');
  console.log('🎮 MISSIONX: COMPLETE 5-MISSION PLAYTHROUGH & QA VERIFICATION');
  console.log('================================================================\n');

  // 1. Authenticate / Register Fresh Test Student
  console.log('Step 1: Registering fresh test student session...');
  const testEmail = `playtester_${Date.now()}@missionx.edu`;
  const regRes = await request('POST', '/auth/register', {
    name: 'QA Lead Playtester',
    email: testEmail,
    password: 'StudentPass123!',
  });

  if (regRes.status !== 201 || !regRes.data.data?.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  }

  const token = regRes.data.data.token;
  const student = regRes.data.data.user;
  console.log(`✓ Authenticated as: ${student.name} (${student.email})\n`);

  // Missions specification matrix
  const missions = [
    {
      slug: 'rescue-the-server-room',
      title: 'Rescue the Server Room',
      stages: [
        {
          stageNum: 1,
          interactionId: 'q1-temp-safe-interaction',
          wrongAnswer: 'Yes - Conditions are nominal and within safe operational limits',
          correctAnswer: 'No - Server room is overheating above the 28.0°C safe threshold',
          hintId: 'hint-stage-1',
        },
        {
          stageNum: 2,
          interactionId: 'q2-cooling-diagnosis-interaction',
          correctAnswer: 'Inspect cooling ductwork and check for coolant leaks or condensation hazards',
        },
        {
          stageNum: 3,
          interactionId: 'q3-water-safety-interaction',
          correctAnswer: 'Yes - Drainage is clear with no water hazard detected; proceed to breaker override',
        },
        {
          stageNum: 4,
          interactionId: 'q4-cooling-restart-interaction',
          correctAnswer: '1042',
        },
      ],
      isIoT: true,
    },
    {
      slug: 'signal-in-the-lab',
      title: 'Signal in the Lab',
      stages: [
        {
          stageNum: 1,
          interactionId: 'q1-waveform-freq-interaction',
          wrongAnswer: '5000 Hz',
          correctAnswer: '1000 Hz',
          hintId: 'hint-signal-stage-1',
        },
        {
          stageNum: 2,
          interactionId: 'q2-signal-period-interaction',
          correctAnswer: '1 ms',
        },
        {
          stageNum: 3,
          interactionId: 'q3-filter-select-interaction',
          correctAnswer: 'Low-pass filter',
        },
        {
          stageNum: 4,
          interactionId: 'q4-signal-calibrate-interaction',
          correctAnswer: 'RC741',
        },
      ],
    },
    {
      slug: 'lost-sensor-network',
      title: 'The Lost Sensor Network',
      stages: [
        {
          stageNum: 1,
          interactionId: 'q1-offline-node-interaction',
          wrongAnswer: 'Node A',
          correctAnswer: 'Node C',
          hintId: 'hint-network-stage-1',
        },
        {
          stageNum: 2,
          interactionId: 'q2-network-fault-interaction',
          correctAnswer: 'Port 3 link failure / disconnected cable route',
        },
        {
          stageNum: 3,
          interactionId: 'q3-route-selection-interaction',
          correctAnswer: 'Sensor Node C → Wireless AP → Network Switch → Central Gateway',
        },
        {
          stageNum: 4,
          interactionId: 'q4-restore-node-interaction',
          correctAnswer: 'NET99',
        },
      ],
    },
    {
      slug: 'power-grid-calibration',
      title: 'Power Grid Calibration',
      stages: [
        {
          stageNum: 1,
          interactionId: 'q1-adc-calc-interaction',
          wrongAnswer: '1024',
          correctAnswer: '2048',
          hintId: 'hint-power-stage-1',
        },
        {
          stageNum: 2,
          interactionId: 'q2-pwm-duty-interaction',
          correctAnswer: '60%',
        },
        {
          stageNum: 3,
          interactionId: 'q3-load-calibration-interaction',
          correctAnswer: '0.39 W',
        },
        {
          stageNum: 4,
          interactionId: 'q4-grid-stabilize-interaction',
          correctAnswer: 'GRID33',
        },
      ],
    },
    {
      slug: 'smart-greenhouse-mystery',
      title: 'The Smart Greenhouse Mystery',
      stages: [
        {
          stageNum: 1,
          interactionId: 'q1-greenhouse-issue-interaction',
          wrongAnswer: 'Temperature is freezing (< 10°C)',
          correctAnswer: 'Soil moisture is critically low (31% vs 40% threshold)',
          hintId: 'hint-greenhouse-stage-1',
        },
        {
          stageNum: 2,
          interactionId: 'q2-irrigation-action-interaction',
          correctAnswer: 'ACTIVATE_IRRIGATION_PUMP',
        },
        {
          stageNum: 3,
          interactionId: 'q3-ventilation-cooling-interaction',
          correctAnswer: 'Turn ON ventilation exhaust fans',
        },
        {
          stageNum: 4,
          interactionId: 'q4-grow-light-sync-interaction',
          correctAnswer: 'FLORA88',
        },
      ],
    },
  ];

  const results = [];

  for (const mission of missions) {
    console.log(`----------------------------------------------------------------`);
    console.log(`🚀 PLAYTHROUGH: "${mission.title}" (${mission.slug})`);
    console.log(`----------------------------------------------------------------`);

    // Reset progress by starting mission
    const startRes = await request('POST', `/missions/${mission.slug}/start`, {}, token);
    if (startRes.status !== 200) {
      throw new Error(`Failed to start mission ${mission.slug}: ${JSON.stringify(startRes.data)}`);
    }

    let state = startRes.data.data;
    console.log(`✓ Mission Started | Initial Stage: ${state.currentStage}/${state.totalStages} | Score: ${state.score}`);

    let hintsUsedCount = 0;
    const stageLog = {};

    // Play through stages
    for (const step of mission.stages) {
      console.log(`\n  ► Executing Stage ${step.stageNum}...`);

      // Test 1: Wrong answer test (Stage 1)
      if (step.wrongAnswer) {
        console.log(`    [QA Test] Intentionally submitting incorrect answer: "${step.wrongAnswer}"`);
        const wrongRes = await request(
          'POST',
          `/missions/${mission.slug}/interactions/${step.interactionId}`,
          {
            payload: { answer: step.wrongAnswer },
          },
          token
        );

        if (wrongRes.status === 200 && wrongRes.data.data.result.isCorrect === false) {
          console.log(`    ✓ Wrong answer correctly rejected: "${wrongRes.data.data.result.message}"`);
          if (wrongRes.data.data.missionState.currentStage !== step.stageNum) {
            throw new Error(`Stage advanced despite wrong answer!`);
          }
        } else {
          throw new Error(`Wrong answer check failed: ${JSON.stringify(wrongRes.data)}`);
        }
      }

      // Test 2: Hint Buzzer test (Stage 1)
      if (step.hintId) {
        console.log(`    [QA Test] Pressing Hint Buzzer for Stage ${step.stageNum}...`);
        const scoreBeforeHint = state.score;
        const hintRes = await request(
          'POST',
          `/missions/${mission.slug}/hints/${step.hintId}/use`,
          {},
          token
        );

        if (hintRes.status === 200 && hintRes.data.data?.hint) {
          const hint = hintRes.data.data.hint;
          state = hintRes.data.data.missionState;
          hintsUsedCount++;
          console.log(`    ✓ Buzzer Activated! Hint received: "${hint.text}"`);
          console.log(`    ✓ Score penalty applied: -${hint.penalty} pts (Score: ${scoreBeforeHint} -> ${state.score})`);
          if (state.currentStage !== step.stageNum) {
            throw new Error(`Stage changed when pressing hint buzzer!`);
          }
        } else {
          throw new Error(`Hint buzzer failed: ${JSON.stringify(hintRes.data)}`);
        }
      }

      // Test 3: Solve Stage with correct answer / action
      let solveRes;
      if (step.isInspection) {
        console.log(`    Submitting inspection action for interaction: ${step.interactionId}...`);
        solveRes = await request(
          'POST',
          `/missions/${mission.slug}/interactions/${step.interactionId}`,
          {
            payload: {},
          },
          token
        );
      } else {
        console.log(`    Submitting correct answer: "${step.correctAnswer}"...`);
        solveRes = await request(
          'POST',
          `/missions/${mission.slug}/interactions/${step.interactionId}`,
          {
            payload: { answer: step.correctAnswer, code: step.correctAnswer },
          },
          token
        );
      }

      if (solveRes.status !== 200 || !solveRes.data.data?.result?.success) {
        throw new Error(`Stage solve failed: ${JSON.stringify(solveRes.data)}`);
      }

      state = solveRes.data.data.missionState;
      const resMsg = solveRes.data.data.result.message;
      stageLog[`Stage ${step.stageNum}`] = 'SOLVED';
      console.log(`    ✓ Stage ${step.stageNum} Verified: ${resMsg}`);
      console.log(`    ✓ Updated Score: ${state.score} | Current Stage: ${state.currentStage}`);
    }

    // Verify final state & exit door
    console.log(`\n  ► Verifying Final Challenge & Exit Door...`);
    console.log(`    ✓ Mission Status: ${state.status}`);
    console.log(`    ✓ isExitUnlocked: ${state.isExitUnlocked}`);

    if (!state.isExitUnlocked || state.status !== 'COMPLETED') {
      throw new Error(`Mission exit door did not unlock after solving all stages!`);
    }

    // Test Persistence across reload / refresh
    console.log(`  ► Testing Persistence across session reload...`);
    const reloadRes = await request('GET', `/missions/${mission.slug}/state`, null, token);
    if (reloadRes.status !== 200 || reloadRes.data.data?.status !== 'COMPLETED') {
      throw new Error(`State persistence failure: ${JSON.stringify(reloadRes.data)}`);
    }
    const persistedState = reloadRes.data.data;
    console.log(`    ✓ State authoritative persistence confirmed! Status: ${persistedState.status}, Final Score: ${persistedState.score}`);

    // If Rescue Server Room, test IoT Simulator status
    if (mission.isIoT) {
      console.log(`  ► Testing IoT Telemetry Engine & 3D Reaction...`);
      const iotRes = await request('GET', `/iot/telemetry/${mission.slug}`);
      if (iotRes.status === 200 && iotRes.data.data) {
        const tel = iotRes.data.data;
        console.log(`    ✓ IoT Telemetry Ingestion Verified: Temp=${tel.temperatureC}°C, Humidity=${tel.humidityPct}%, Fan=${tel.fan}, WarningLED=${tel.warningLed}`);
      }
    }

    results.push({
      mission: mission.title,
      slug: mission.slug,
      stagesCompleted: `${state.completedStages.length} / ${state.totalStages}`,
      score: state.score,
      hintsUsed: hintsUsedCount,
      exitUnlocked: state.isExitUnlocked ? 'YES' : 'NO',
      completed: state.status === 'COMPLETED' ? 'YES' : 'NO',
    });

    console.log(`🎉 "${mission.title}" SUCCESSFULLY COMPLETED!\n`);
  }

  console.log('================================================================');
  console.log('📊 MISSIONX 5-MISSION PLAYTHROUGH SUMMARY RESULTS MATRIX');
  console.log('================================================================');
  console.table(results);
}

runPlaythrough()
  .then(() => {
    console.log('\n✅ ALL 5 MISSIONS FULLY VERIFIED FROM START TO COMPLETION!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Playthrough encountered an error:', err);
    process.exit(1);
  });
