'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMissionEngine } from '@/hooks/useMissionEngine';
import { useAuthStore } from '@/store/useAuthStore';
import CustomCursor from '@/components/3d/UI/CustomCursor';
import { MissionHUD } from '@/components/3d/UI/MissionHUD';
import { InteractionPrompt } from '@/components/3d/UI/InteractionPrompt';
import { InteractionModal } from '@/components/3d/UI/InteractionModal';
import { QuestionModal } from '@/components/3d/UI/QuestionModal';
import { ObjectiveDrawer } from '@/components/3d/UI/ObjectiveDrawer';
import { StageNotification } from '@/components/3d/UI/StageNotification';
import { soundEffects } from '@/components/3d/Sound/soundEffects';
import { useIoTStore } from '@/store/useIoTStore';
import {
  RefreshCw,
  AlertTriangle,
  Trophy,
  DoorOpen,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Lock,
} from 'lucide-react';

// SSR-Safe Dynamic Import for React Three Fiber Canvas
const MissionCanvas = dynamic(
  () =>
    import('@/components/3d/Canvas/MissionCanvas').then(
      (mod) => mod.MissionCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="tracking-widest uppercase text-cyan-300 font-bold">
          Synthesizing Virtual Datacenter Environment...
        </span>
      </div>
    ),
  }
);

export default function MissionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    missionState,
    isLoading,
    isInteracting,
    lastResult,
    recentEvents,
    error,
    interact,
    requestHint,
    refreshState,
  } = useMissionEngine(slug);

  // Real-time IoT Store integration
  const {
    initSocket: initIoTSocket,
    leaveSocket: leaveIoTSocket,
    connectionStatus: iotConnectionStatus,
    sensors: iotSensors,
    actuators: iotActuators,
  } = useIoTStore();

  // Connect to realtime Socket.IO mission room
  React.useEffect(() => {
    if (slug) {
      initIoTSocket(slug);
    }
    return () => {
      leaveIoTSocket();
    };
  }, [slug, initIoTSocket, leaveIoTSocket]);

  // Hover state for 3D cursor & prompt
  const [hoveredObject, setHoveredObject] = useState<{
    id: string | null;
    name: string | null;
    isLocked: boolean;
  }>({
    id: null,
    name: null,
    isLocked: false,
  });

  // Modal dialog states
  const [interactionModalData, setInteractionModalData] = useState<{
    isOpen: boolean;
    title: string;
    objectId: string;
    isLocked: boolean;
    feedbackMessage?: string;
    config?: any;
    interactionId?: string;
  }>({
    isOpen: false,
    title: '',
    objectId: '',
    isLocked: false,
  });

  const [questionModalData, setQuestionModalData] = useState<{
    isOpen: boolean;
    question: any | null;
    interactionId: string;
  }>({
    isOpen: false,
    question: null,
    interactionId: '',
  });

  // Drawer & Debug states
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [missionCompleteModal, setMissionCompleteModal] = useState(false);

  // Pointer Hover Callback
  const handleObjectHover = useCallback(
    (id: string | null, name: string | null, isLocked: boolean) => {
      setHoveredObject({ id, name, isLocked });
    },
    []
  );

  // Object Click Router: Matches 3D object to authoritative Mission Engine interactions
  const handleObjectClick = useCallback(
    async (objectId: string) => {
      if (!missionState) return;

      soundEffects.playClick();

      // Check special Exit Door interaction
      if (objectId === 'exit_door') {
        if (missionState.isExitUnlocked || missionState.status === 'COMPLETED') {
          soundEffects.playCompletion();
          setMissionCompleteModal(true);
          return;
        } else {
          soundEffects.playAlert();
          setInteractionModalData({
            isOpen: true,
            title: 'Hermetic Exit Portal',
            objectId: 'exit_door',
            isLocked: true,
            feedbackMessage:
              'Security lockdown active. Complete all 4 engineering recovery stages to disengage the blast door interlock.',
          });
          return;
        }
      }

      // Find matching interactions for this object
      const matchingInteractions = missionState.availableInteractions.filter(
        (i) => i.targetObjectId === objectId
      );

      // Separate question interaction from inspection interaction
      const questionInteraction = matchingInteractions.find((i) => Boolean(i.questionId));
      const inspectInteraction = matchingInteractions.find((i) => !i.questionId);

      // If already inspected (or no separate inspect interaction), prioritize question interaction
      let matchingInteraction = inspectInteraction || questionInteraction || matchingInteractions[0];
      if (
        inspectInteraction &&
        missionState.completedInteractions?.includes(inspectInteraction.id) &&
        questionInteraction
      ) {
        matchingInteraction = questionInteraction;
      }

      // Check if object is unlocked
      const sceneObj = missionState.sceneObjects.find((o) => o.id === objectId);
      const isObjectUnlocked =
        missionState.unlockedObjects.includes(objectId) ||
        Boolean(sceneObj && !sceneObj.locked) ||
        Boolean(sceneObj && sceneObj.stageId === missionState.activeStage?.id);

      // If interaction has a question tied to it directly
      if (matchingInteraction && matchingInteraction.questionId) {
        const question = missionState.availableQuestions.find(
          (q) => q.id === matchingInteraction.questionId
        );
        if (question) {
          setQuestionModalData({
            isOpen: true,
            question,
            interactionId: matchingInteraction.id,
          });
          return;
        }
      }

      // Generate live telemetry config overrides for inspection
      let liveConfig: any = matchingInteraction?.config || sceneObj?.metadata;
      if (objectId === 'temperature_sensor') {
        liveConfig = {
          sensorModel: 'DHT22 Digital Temperature Probe',
          currentTelemetry: `${iotSensors.temperatureC.toFixed(1)} °C`,
          status: iotSensors.temperatureC > 28.0 ? 'CRITICAL OVERHEATING' : 'NOMINAL SAFE',
          safeEnvelope: '20.0 °C - 28.0 °C',
        };
      } else if (objectId === 'humidity_sensor') {
        liveConfig = {
          sensorModel: 'DHT22 Relative Humidity Sensor',
          currentTelemetry: `${iotSensors.humidityPct.toFixed(1)} %`,
          status: iotSensors.humidityPct > 60.0 ? 'ELEVATED' : 'NOMINAL',
          safeEnvelope: '40.0 % - 60.0 %',
        };
      } else if (objectId === 'cooling_fan') {
        liveConfig = {
          blowerModel: 'CRAC Unit #4 Centrifugal Blower',
          actuatorState: iotActuators.fan ? 'ENERGIZED (ON)' : 'STOPPED (OFF)',
          breakerCircuit: 'BREAKER CB-404',
          rpm: iotActuators.fan ? 2400 : 0,
        };
      } else if (objectId === 'water_sensor' || objectId === 'drainage_tray') {
        liveConfig = {
          sensorType: 'Resistive Drip Tray Probe',
          reading: iotSensors.waterDetected ? '3.3V (HIGH - LIQUID DETECTED)' : '0.0V (LOW - DRY)',
          status: iotSensors.waterDetected ? 'HAZARD CONDENSATION OVERFLOW' : 'DRY NOMINAL',
        };
      } else if (objectId === 'control_panel') {
        liveConfig = {
          ambientTemp: `${iotSensors.temperatureC.toFixed(1)} °C`,
          ambientHumidity: `${iotSensors.humidityPct.toFixed(1)} %`,
          fanCircuit: iotActuators.fan ? 'ENERGIZED' : 'TRIPPED',
          alarmState: iotActuators.warningLed ? 'ACTIVE' : 'STANDBY',
          waterSensor: iotSensors.waterDetected ? 'ALARM' : 'CLEAR',
        };
      }

      // Open inspection modal
      setInteractionModalData({
        isOpen: true,
        title: matchingInteraction?.title || sceneObj?.name || objectId,
        objectId,
        isLocked: !isObjectUnlocked,
        feedbackMessage: matchingInteraction?.feedbackMessage || undefined,
        config: liveConfig,
        interactionId: matchingInteraction?.id,
      });
    },
    [missionState, iotSensors, iotActuators]
  );

  // Confirm Inspection Interaction
  const handleConfirmInspection = async () => {
    if (!interactionModalData.interactionId) {
      setInteractionModalData((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const result = await interact(interactionModalData.interactionId);
    setInteractionModalData((prev) => ({ ...prev, isOpen: false }));

    if (result && result.success) {
      soundEffects.playUnlock();

      // If a stage question is available now, automatically prompt it
      if (missionState && missionState.availableQuestions.length > 0) {
        const nextQ = missionState.availableQuestions[0];
        const nextQInteraction = missionState.availableInteractions.find(
          (i) => i.questionId === nextQ.id
        );
        if (nextQInteraction) {
          setTimeout(() => {
            setQuestionModalData({
              isOpen: true,
              question: nextQ,
              interactionId: nextQInteraction.id,
            });
          }, 400);
        }
      }
    } else {
      soundEffects.playAlert();
    }
  };

  // Submit Answer to Authoritative Mission Engine
  const handleSubmitQuestionAnswer = async (
    interactionId: string,
    answer: string
  ): Promise<boolean> => {
    const result = await interact(interactionId, { answer, code: answer });
    if (result && result.success) {
      // Check if this was final stage or unlocked door
      if (missionState?.isExitUnlocked) {
        soundEffects.playCompletion();
      }
      return true;
    }
    return false;
  };

  // Loading Screen
  if (isLoading || !missionState) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 tracking-wider">
            Initializing authoritative mission gameplay engine...
          </p>
        </div>
      </div>
    );
  }

  const isModalActive =
    interactionModalData.isOpen ||
    questionModalData.isOpen ||
    isObjectivesOpen ||
    isCluesOpen ||
    missionCompleteModal;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Custom Double-Circle Reticle Cursor */}
      <CustomCursor
        isHoveringInteractive={Boolean(hoveredObject.id && !hoveredObject.isLocked)}
        isHoveringLocked={hoveredObject.isLocked}
        hoverLabel={hoveredObject.name || undefined}
      />

      {/* Top Glassmorphic HUD Bar */}
      <MissionHUD
        title={missionState.title}
        currentStage={missionState.currentStage}
        totalStages={missionState.totalStages}
        stageTitle={missionState.activeStage?.title || 'Phase Investigation'}
        stageObjective={
          missionState.activeStage?.objective || 'Analyze telemetry anomalies'
        }
        score={missionState.score}
        xp={missionState.xp}
        cluesCount={missionState.revealedClues.length}
        connectionStatus={iotConnectionStatus}
        onToggleObjectives={() => setIsObjectivesOpen((prev) => !prev)}
        onToggleClues={() => setIsObjectivesOpen(true)}
        onToggleDebug={() => setShowDebug((prev) => !prev)}
        showDebug={showDebug}
      />

      {/* Live Event Notifications */}
      <StageNotification events={recentEvents} />

      {/* 3D Datacenter Canvas Viewport */}
      <div className="w-full h-full">
        <MissionCanvas
          missionState={missionState}
          isInputPaused={isModalActive}
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
        />
      </div>

      {/* Hover Interaction Prompt */}
      <InteractionPrompt
        objectId={hoveredObject.id}
        objectName={hoveredObject.name}
        isLocked={hoveredObject.isLocked}
        onInteract={() => hoveredObject.id && handleObjectClick(hoveredObject.id)}
      />

      {/* Technical Inspection Modal */}
      <InteractionModal
        isOpen={interactionModalData.isOpen}
        onClose={() =>
          setInteractionModalData((prev) => ({ ...prev, isOpen: false }))
        }
        title={interactionModalData.title}
        objectId={interactionModalData.objectId}
        isLocked={interactionModalData.isLocked}
        feedbackMessage={interactionModalData.feedbackMessage}
        config={interactionModalData.config}
        isLoading={isInteracting}
        onConfirm={handleConfirmInspection}
      />

      {/* Engineering Challenge Question Modal */}
      <QuestionModal
        isOpen={questionModalData.isOpen}
        onClose={() =>
          setQuestionModalData({ isOpen: false, question: null, interactionId: '' })
        }
        question={questionModalData.question}
        interactionId={questionModalData.interactionId}
        isSubmitting={isInteracting}
        onSubmit={handleSubmitQuestionAnswer}
      />

      {/* Slide-in Objective & Intelligence Drawer */}
      <ObjectiveDrawer
        isOpen={isObjectivesOpen}
        onClose={() => setIsObjectivesOpen(false)}
        missionState={missionState}
        onRequestHint={requestHint}
      />

      {/* Mission Accomplished Exit Modal */}
      {missionCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MISSION STATUS: COMPLETED</span>
              </div>
              <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
                {missionState.title}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                All engineering diagnostic challenges solved and facility escape portal successfully disengaged!
              </p>
            </div>

            {/* Performance Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">FINAL SCORE</span>
                <span className="text-amber-400 font-bold text-base">
                  {missionState.score}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EARNED XP</span>
                <span className="text-purple-400 font-bold text-base">
                  +{missionState.xp} XP
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STAGES SOLVED</span>
                <span className="text-cyan-400 font-bold text-base">
                  {missionState.completedStages.length} / {missionState.totalStages}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">HINTS USED</span>
                <span className="text-slate-300 font-bold text-base">
                  {missionState.usedHints.length}
                </span>
              </div>
            </div>

            {/* Rewards Earned List */}
            {missionState.rewards && missionState.rewards.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Rewards & Credentials Earned:
                </span>
                <div className="space-y-1 text-xs font-mono text-cyan-300">
                  {missionState.rewards
                    .filter((r: any) => r.type === 'BADGE' || r.type === 'CLUE')
                    .map((r: any, i: number) => (
                      <div key={i} className="flex items-center space-x-1.5">
                        <span className="text-amber-400">★</span>
                        <span>{r.value || r.badgeId || r.id}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/missions"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
              >
                <span>Return to Mission Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs uppercase tracking-wider transition"
              >
                <span>Student Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Development Debug Drawer */}
      {process.env.NODE_ENV !== 'production' && showDebug && (
        <div className="fixed bottom-16 right-4 w-96 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl z-40 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-cyan-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> ENGINE DEBUGGER
            </span>
            <button
              onClick={() => setShowDebug(false)}
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="py-2 space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500">Stage:</span>{' '}
              <span className="text-white">
                {missionState.currentStage} / {missionState.totalStages} (
                {missionState.activeStage?.id})
              </span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              <span className="text-emerald-400">{missionState.status}</span>
            </div>
            <div>
              <span className="text-slate-500">Unlocked:</span>{' '}
              <span className="text-cyan-300">
                {missionState.unlockedObjects.join(', ') || 'None'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Exit Unlocked:</span>{' '}
              <span
                className={
                  missionState.isExitUnlocked ? 'text-emerald-400' : 'text-red-400'
                }
              >
                {String(missionState.isExitUnlocked)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Available Interactions:</span>
              <ul className="list-disc pl-4 mt-1 text-slate-400">
                {missionState.availableInteractions.map((i) => (
                  <li key={i.id}>{i.id} ({i.targetObjectId})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
