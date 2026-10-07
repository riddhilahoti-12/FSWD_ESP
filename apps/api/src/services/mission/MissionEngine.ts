import {
  MissionDefinition,
  MissionState,
  InteractionResult,
  MissionEvent,
  StageDefinition,
  ClientQuestion,
  UsedHintRecord,
} from '@missionx/shared';
import { MissionModel } from '../../models/Mission';
import { ProgressModel, IProgressDocument } from '../../models/Progress';
import { UserModel } from '../../models/User';
import { MissionRegistry } from './MissionRegistry';
import { MissionValidator } from './MissionValidator';
import { UnlockService } from './UnlockService';
import { RewardService } from './RewardService';
import { MissionEventService } from './MissionEventService';

export class MissionEngine {
  /**
   * Helper: Resolves authoritative mission definition from DB or Registry
   */
  public static async resolveMissionDefinition(
    missionIdOrSlug: string
  ): Promise<{ missionDoc: any; definition: MissionDefinition }> {
    // 1. Try finding DB mission
    let missionDoc = await MissionModel.findOne({
      $or: [
        { slug: missionIdOrSlug.toLowerCase() },
        ...(missionIdOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: missionIdOrSlug }] : []),
      ],
    });

    const slug = missionDoc ? missionDoc.slug : missionIdOrSlug;
    const definition = MissionRegistry.getMission(slug);

    if (!definition) {
      throw new Error(`Authoritative mission definition for '${missionIdOrSlug}' not found.`);
    }

    return { missionDoc, definition };
  }

  /**
   * Helper: Resolves or initializes student progress
   */
  public static async resolveProgress(
    studentId: string,
    missionId: string,
    definition: MissionDefinition
  ): Promise<IProgressDocument> {
    let progress = await ProgressModel.findOne({
      studentId,
      missionId,
    });

    if (!progress) {
      // Find initial unlocked objects for stage 1
      const initialUnlocked = definition.scene.objects
        .filter((o) => !o.locked || o.stageId === 'stage-1')
        .map((o) => o.id);

      progress = await ProgressModel.create({
        studentId,
        missionId,
        missionVersion: definition.version,
        currentStage: 1,
        completedStages: [],
        completedInteractions: [],
        answeredQuestions: [],
        unlockedObjects: initialUnlocked,
        revealedClues: [],
        usedHints: [],
        rewards: [],
        eventLog: [],
        score: 0,
        attempts: 1,
        hintsUsed: 0,
        elapsedTime: 0,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      });

      await UserModel.findByIdAndUpdate(studentId, {
        $inc: { 'stats.missionsStarted': 1 },
      });
    }

    return progress;
  }

  /**
   * Builds the full, typed, sanitized MissionState for the client
   */
  public static buildMissionState(
    definition: MissionDefinition,
    progress: IProgressDocument,
    studentId: string,
    dbMissionId: string
  ): MissionState {
    const activeStage =
      definition.stages.find((s) => s.order === progress.currentStage) || null;

    // Filter available interactions for the active stage
    const availableInteractions = activeStage
      ? definition.interactions.filter((i) => i.stageId === activeStage.id)
      : [];

    // Filter available questions (sanitized - no correct answers sent to client!)
    const availableQuestions: ClientQuestion[] = activeStage
      ? definition.questions
          .filter((q) => q.stageId === activeStage.id)
          .map((q) => {
            const { correctAnswer, tolerance, ...safeQ } = q;
            return safeQ;
          })
      : [];

    // Filter hints for active stage
    const usedHintIds = new Set(progress.usedHints.map((h) => h.hintId));
    const availableHints = activeStage
      ? definition.hints
          .filter((h) => h.stageId === activeStage.id)
          .map((h) => ({
            id: h.id,
            stageId: h.stageId,
            penalty: h.penalty,
            order: h.order,
            isUsed: usedHintIds.has(h.id),
            text: usedHintIds.has(h.id) ? h.text : undefined,
          }))
      : [];

    // Recalculate dynamic unlocked objects
    const unlockedObjects = UnlockService.calculateUnlockedObjects(
      definition.scene.objects,
      progress,
      definition.stages
    );

    const isExitUnlocked =
      unlockedObjects.includes('exit_door') || progress.status === 'COMPLETED';

    return {
      missionId: dbMissionId,
      slug: definition.slug,
      title: definition.title,
      missionVersion: definition.version,
      studentId: studentId.toString(),
      currentStage: progress.currentStage,
      totalStages: definition.stages.length,
      completedStages: progress.completedStages,
      unlockedObjects,
      revealedClues: progress.revealedClues.map((c) => ({
        clueId: c.clueId,
        text: c.text,
        revealedAt: new Date(c.revealedAt).toISOString(),
      })),
      answeredQuestions: progress.answeredQuestions.map((q) => ({
        questionId: q.questionId,
        answer: q.answer,
        isCorrect: q.isCorrect,
        pointsAwarded: q.pointsAwarded,
        attempts: q.attempts,
        answeredAt: new Date(q.answeredAt).toISOString(),
      })),
      usedHints: progress.usedHints.map((h) => ({
        hintId: h.hintId,
        text: h.text,
        penalty: h.penalty,
        usedAt: new Date(h.usedAt).toISOString(),
      })),
      completedInteractions: progress.completedInteractions,
      score: progress.score,
      xp: 0, // Enriched from user profile when needed
      attempts: progress.attempts,
      hintsUsed: progress.hintsUsed,
      elapsedTime: progress.elapsedTime,
      status: progress.status,
      activeStage,
      availableInteractions,
      availableQuestions,
      availableHints,
      sceneObjects: definition.scene.objects.map((obj) => ({
        ...obj,
        locked: !unlockedObjects.includes(obj.id),
      })),
      isExitUnlocked,
      rewards: (progress.rewards || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        value: r.value,
        grantedAt: new Date(r.grantedAt).toISOString(),
      })),
    };
  }

  /**
   * Fetches current authoritative mission state for a student
   */
  public static async getMissionState(
    studentId: string,
    missionIdOrSlug: string
  ): Promise<MissionState> {
    const { missionDoc, definition } = await this.resolveMissionDefinition(missionIdOrSlug);
    const dbMissionId = missionDoc ? missionDoc._id.toString() : definition.id;

    const progress = await this.resolveProgress(studentId, dbMissionId, definition);

    // Sync user stats
    const student = await UserModel.findById(studentId);
    const state = this.buildMissionState(definition, progress, studentId, dbMissionId);
    state.xp = student?.stats?.xp || 0;

    return state;
  }

  /**
   * Main Gameplay Engine: Process an interaction request
   */
  public static async processInteraction(
    studentId: string,
    missionIdOrSlug: string,
    interactionId: string,
    payload: any = {}
  ): Promise<{ result: InteractionResult; missionState: MissionState; events: MissionEvent[] }> {
    const { missionDoc, definition } = await this.resolveMissionDefinition(missionIdOrSlug);
    const dbMissionId = missionDoc ? missionDoc._id.toString() : definition.id;

    const progress = await this.resolveProgress(studentId, dbMissionId, definition);

    if (progress.status === 'COMPLETED') {
      const state = this.buildMissionState(definition, progress, studentId, dbMissionId);
      return {
        result: {
          success: true,
          message: 'Mission already completed! You can review past diagnostic stages.',
          interactionId,
          missionCompleted: true,
        },
        missionState: state,
        events: [],
      };
    }

    // 1. Find interaction definition
    const interaction = definition.interactions.find((i) => i.id === interactionId);
    if (!interaction) {
      throw new Error(`Interaction '${interactionId}' does not exist in mission definition.`);
    }

    // 2. Validate stage and availability
    const activeStage = definition.stages.find((s) => s.order === progress.currentStage);
    if (!activeStage) {
      throw new Error(`Active stage definition for order ${progress.currentStage} not found.`);
    }

    const availability = MissionValidator.validateInteractionAvailability(
      activeStage,
      interaction,
      progress.unlockedObjects
    );

    if (!availability.isAllowed) {
      throw new Error(availability.reason || 'Interaction is not allowed in current stage.');
    }

    const events: MissionEvent[] = [];
    let isCorrect: boolean | undefined = undefined;
    let stageCompleted = false;
    let missionCompleted = false;
    let message = interaction.feedbackMessage || 'Interaction processed.';
    let grantedRewards: any[] = [];

    // Mark interaction completed in progress
    if (!progress.completedInteractions.includes(interaction.id)) {
      progress.completedInteractions.push(interaction.id);
    }

    // 3. Process QUESTION / CODE / SUBMISSION
    if (interaction.questionId) {
      const question = definition.questions.find((q) => q.id === interaction.questionId);
      if (!question) {
        throw new Error(`Question '${interaction.questionId}' not found.`);
      }

      // Check if student already answered this question correctly
      const existingRecord = progress.answeredQuestions.find(
        (q) => q.questionId === question.id && q.isCorrect
      );

      if (existingRecord) {
        message = 'You have already answered this question correctly.';
        isCorrect = true;
      } else {
        const studentAnswer = payload.answer !== undefined ? payload.answer : payload.code;
        const validation = MissionValidator.validateAnswer(question, studentAnswer);
        isCorrect = validation.isCorrect;
        message = validation.feedback;

        progress.attempts += 1;

        progress.answeredQuestions.push({
          questionId: question.id,
          answer: studentAnswer,
          isCorrect,
          pointsAwarded: isCorrect ? question.points : 0,
          attempts: 1,
          answeredAt: new Date().toISOString(),
        });

        if (isCorrect) {
          progress.score += question.points;

          events.push(
            MissionEventService.createEvent(
              'QUESTION_ANSWERED',
              dbMissionId,
              studentId,
              activeStage.id,
              interaction.targetObjectId,
              { questionId: question.id, points: question.points }
            )
          );

          // Check if all questions in the active stage are answered correctly
          const stageQuestions = definition.questions.filter((q) => q.stageId === activeStage.id);
          const allStageQuestionsCorrect = stageQuestions.every((q) =>
            progress.answeredQuestions.some((ans) => ans.questionId === q.id && ans.isCorrect)
          );

          if (allStageQuestionsCorrect) {
            stageCompleted = true;
            if (!progress.completedStages.includes(activeStage.order)) {
              progress.completedStages.push(activeStage.order);
            }

            events.push(
              MissionEventService.createEvent(
                'STAGE_COMPLETED',
                dbMissionId,
                studentId,
                activeStage.id,
                interaction.targetObjectId,
                { completedStageOrder: activeStage.order }
              )
            );

            // Grant Stage Rewards
            const stageRewards = definition.rewards.filter((r) =>
              activeStage.rewardIds.includes(r.id)
            );
            grantedRewards = await RewardService.applyRewards(stageRewards, progress, studentId);

            for (const reward of grantedRewards) {
              events.push(
                MissionEventService.createEvent(
                  'REWARD_GRANTED',
                  dbMissionId,
                  studentId,
                  activeStage.id,
                  undefined,
                  { reward }
                )
              );
            }

            // Recalculate newly unlocked objects
            const newlyUnlocked = UnlockService.calculateUnlockedObjects(
              definition.scene.objects,
              progress,
              definition.stages
            );

            for (const objId of newlyUnlocked) {
              if (!progress.unlockedObjects.includes(objId)) {
                progress.unlockedObjects.push(objId);
                events.push(
                  MissionEventService.createEvent(
                    'OBJECT_UNLOCKED',
                    dbMissionId,
                    studentId,
                    activeStage.id,
                    objId
                  )
                );
              }
            }

            // Check if final stage
            if (activeStage.isFinalStage || activeStage.order >= definition.stages.length) {
              missionCompleted = true;
              progress.status = 'COMPLETED';
              progress.completedAt = new Date();

              // Unlock Exit Door
              if (!progress.unlockedObjects.includes('exit_door')) {
                progress.unlockedObjects.push('exit_door');
              }

              events.push(
                MissionEventService.createEvent(
                  'DOOR_UNLOCKED',
                  dbMissionId,
                  studentId,
                  activeStage.id,
                  'exit_door'
                )
              );

              events.push(
                MissionEventService.createEvent(
                  'MISSION_COMPLETED',
                  dbMissionId,
                  studentId,
                  activeStage.id,
                  undefined,
                  { finalScore: progress.score }
                )
              );

              // Update user stats
              await UserModel.findByIdAndUpdate(studentId, {
                $inc: { 'stats.missionsCompleted': 1 },
              });
            } else {
              // Advance to next stage
              progress.currentStage += 1;
            }
          }
        }
      }
    } else {
      // 4. Process OBJECT INSPECTION / SENSOR / ACTUATOR
      events.push(
        MissionEventService.createEvent(
          interaction.successEvent || 'OBJECT_INSPECTED',
          dbMissionId,
          studentId,
          activeStage.id,
          interaction.targetObjectId,
          { config: interaction.config }
        )
      );

      // Recalculate dynamic unlocks
      const newlyUnlocked = UnlockService.calculateUnlockedObjects(
        definition.scene.objects,
        progress,
        definition.stages
      );

      for (const objId of newlyUnlocked) {
        if (!progress.unlockedObjects.includes(objId)) {
          progress.unlockedObjects.push(objId);
          events.push(
            MissionEventService.createEvent(
              'OBJECT_UNLOCKED',
              dbMissionId,
              studentId,
              activeStage.id,
              objId
            )
          );
        }
      }
    }

    // Append to progress event log
    progress.eventLog.push(...events);

    // Save progress updates
    await progress.save();

    // Rebuild mission state
    const student = await UserModel.findById(studentId);
    const missionState = this.buildMissionState(definition, progress, studentId, dbMissionId);
    missionState.xp = student?.stats?.xp || 0;

    return {
      result: {
        success: isCorrect !== undefined ? isCorrect : true,
        message,
        interactionId,
        targetObjectId: interaction.targetObjectId,
        isCorrect,
        feedbackData: interaction.config,
        stageCompleted,
        missionCompleted,
        unlockedObjects: progress.unlockedObjects,
        grantedRewards,
      },
      missionState,
      events,
    };
  }

  /**
   * Hint Engine: Provides hints with configured score penalties
   */
  public static async useHint(
    studentId: string,
    missionIdOrSlug: string,
    hintId: string
  ): Promise<{ hint: UsedHintRecord; missionState: MissionState; events: MissionEvent[] }> {
    const { missionDoc, definition } = await this.resolveMissionDefinition(missionIdOrSlug);
    const dbMissionId = missionDoc ? missionDoc._id.toString() : definition.id;

    const progress = await this.resolveProgress(studentId, dbMissionId, definition);

    const hintDef = definition.hints.find((h) => h.id === hintId);
    if (!hintDef) {
      throw new Error(`Hint '${hintId}' not found.`);
    }

    // Check if hint was already used
    const existing = progress.usedHints.find((h) => h.hintId === hintId);
    if (existing) {
      const student = await UserModel.findById(studentId);
      const missionState = this.buildMissionState(definition, progress, studentId, dbMissionId);
      missionState.xp = student?.stats?.xp || 0;
      return {
        hint: {
          hintId: existing.hintId,
          text: existing.text,
          penalty: existing.penalty,
          usedAt: new Date(existing.usedAt).toISOString(),
        },
        missionState,
        events: [],
      };
    }

    // Apply hint penalty
    const penalty = hintDef.penalty || 0;
    progress.score = Math.max(0, progress.score - penalty);
    progress.hintsUsed += 1;

    const record = {
      hintId: hintDef.id,
      text: hintDef.text,
      penalty,
      usedAt: new Date().toISOString(),
    };
    progress.usedHints.push(record);

    const event = MissionEventService.createEvent(
      'CLUE_REVEALED',
      dbMissionId,
      studentId,
      hintDef.stageId,
      undefined,
      { hintId: hintDef.id, penalty }
    );
    progress.eventLog.push(event);

    await progress.save();

    const student = await UserModel.findById(studentId);
    const missionState = this.buildMissionState(definition, progress, studentId, dbMissionId);
    missionState.xp = student?.stats?.xp || 0;

    return {
      hint: {
        hintId: record.hintId,
        text: record.text,
        penalty: record.penalty,
        usedAt: record.usedAt,
      },
      missionState,
      events: [event],
    };
  }
}
