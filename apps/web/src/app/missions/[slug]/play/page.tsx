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

      // Find matching interaction for this object
      const matchingInteraction = missionState.availableInteractions.find(
        (i) => i.targetObjectId === objectId
      );

      // Check if object is unlocked
      const isObjectUnlocked =
        missionState.unlockedObjects.includes(objectId) ||
        (missionState.activeStage?.id === 'stage-1' &&
          (objectId === 'temperature_sensor' || objectId === 'humidity_sensor'));

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

      // Find scene object metadata
      const sceneObj = missionState.sceneObjects.find((o) => o.id === objectId);

      // Open inspection modal
      setInteractionModalData({
        isOpen: true,
        title: matchingInteraction?.title || sceneObj?.name || objectId,
        objectId,
        isLocked: !isObjectUnlocked,
        feedbackMessage: matchingInteraction?.feedbackMessage || undefined,
        config: matchingInteraction?.config || sceneObj?.metadata,
        interactionId: matchingInteraction?.id,
      });
    },
    [missionState]
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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 mx-auto">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-mono text-white uppercase tracking-wider">
                Mission Accomplished!
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                You successfully diagnosed the thermal disparity, verified
                basin clearance, energized the cooling fan, and unlocked the
                hermetic escape portal!
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">FINAL SCORE</span>
                <span className="text-amber-400 font-bold text-base">
                  {missionState.score}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px]">EARNED XP</span>
                <span className="text-purple-400 font-bold text-base">
                  +{missionState.xp} XP
                </span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
            >
              <span>Return to Mission HQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
