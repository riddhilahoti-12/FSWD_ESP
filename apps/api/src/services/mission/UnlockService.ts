import {
  UnlockCondition,
  SceneObjectDefinition,
  StageDefinition,
} from '@missionx/shared';
import { IProgressDocument } from '../../models/Progress';

export class UnlockService {
  /**
   * Evaluates if a specific unlock condition is satisfied given student progress
   */
  public static evaluateCondition(
    condition: UnlockCondition,
    progress: IProgressDocument,
    stageDefinition?: StageDefinition
  ): boolean {
    switch (condition.type) {
      case 'STAGE_COMPLETED': {
        if (!condition.stageId) return false;
        const stageNum = parseInt(condition.stageId.replace(/\D/g, ''), 10);
        return progress.completedStages.includes(stageNum);
      }

      case 'QUESTION_CORRECT': {
        if (!condition.questionId) return false;
        return progress.answeredQuestions.some(
          (q) => q.questionId === condition.questionId && q.isCorrect
        );
      }

      case 'OBJECT_INSPECTED': {
        if (!condition.objectId) return false;
        return progress.completedInteractions.some((id) => id.includes(condition.objectId!));
      }

      case 'CLUE_REVEALED': {
        if (!condition.clueId) return false;
        return progress.revealedClues.some((c) => c.clueId === condition.clueId);
      }

      case 'ALL_REQUIRED_INTERACTIONS': {
        if (condition.requiredInteractionIds && condition.requiredInteractionIds.length > 0) {
          return condition.requiredInteractionIds.every((id) =>
            progress.completedInteractions.includes(id)
          );
        }
        if (stageDefinition) {
          return stageDefinition.interactionIds.every((id) =>
            progress.completedInteractions.includes(id)
          );
        }
        return false;
      }

      case 'CODE_MATCH': {
        if (!condition.expectedCode) return false;
        return progress.answeredQuestions.some(
          (q) => String(q.answer).trim() === condition.expectedCode!.trim() && q.isCorrect
        );
      }

      default:
        return false;
    }
  }

  /**
   * Determines which scene objects should be unlocked given current progress
   */
  public static calculateUnlockedObjects(
    sceneObjects: SceneObjectDefinition[],
    progress: IProgressDocument,
    stages: StageDefinition[]
  ): string[] {
    const unlocked = new Set<string>(progress.unlockedObjects || []);

    for (const obj of sceneObjects) {
      // If object starts unlocked by default
      if (!obj.locked) {
        unlocked.add(obj.id);
        continue;
      }

      // Check stage associations
      const objStageNum = parseInt(obj.stageId.replace(/\D/g, ''), 10);
      if (progress.currentStage >= objStageNum && !obj.metadata?.requiresExplicitUnlock) {
        unlocked.add(obj.id);
        continue;
      }

      // If object metadata specifies unlockConditions
      const conditions: UnlockCondition[] = obj.metadata?.unlockConditions || [];
      if (conditions.length > 0) {
        const stageDef = stages.find((s) => s.id === obj.stageId);
        const allSatisfied = conditions.every((cond) =>
          this.evaluateCondition(cond, progress, stageDef)
        );
        if (allSatisfied) {
          unlocked.add(obj.id);
        }
      }
    }

    return Array.from(unlocked);
  }
}
