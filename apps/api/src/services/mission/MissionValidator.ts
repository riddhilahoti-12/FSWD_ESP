import { QuestionDefinition, InteractionDefinition, StageDefinition } from '@missionx/shared';

export interface AnswerValidationResult {
  isCorrect: boolean;
  feedback: string;
}

export class MissionValidator {
  /**
   * Authoritatively validate student answer against server-side question definition
   */
  public static validateAnswer(
    question: QuestionDefinition,
    userAnswer: any
  ): AnswerValidationResult {
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return {
        isCorrect: false,
        feedback: 'No answer provided.',
      };
    }

    switch (question.type) {
      case 'multiple_choice': {
        const userStr = String(userAnswer).trim().toLowerCase();
        const correctStr = String(question.correctAnswer).trim().toLowerCase();
        const isCorrect = userStr === correctStr;
        return {
          isCorrect,
          feedback: isCorrect
            ? 'Correct! Diagnostics confirmed.'
            : 'Incorrect selection. Review telemetry and system documentation.',
        };
      }

      case 'numeric': {
        const userNum = parseFloat(String(userAnswer).trim());
        const correctNum = parseFloat(String(question.correctAnswer).trim());

        if (isNaN(userNum)) {
          return {
            isCorrect: false,
            feedback: 'Please enter a valid numeric value.',
          };
        }

        const tolerance = question.tolerance ?? 0.1;
        const diff = Math.abs(userNum - correctNum);
        const isCorrect = diff <= tolerance;

        return {
          isCorrect,
          feedback: isCorrect
            ? `Correct value within ±${tolerance} tolerance.`
            : `Reading deviates beyond acceptable tolerance of ±${tolerance}. Check sensor readings.`,
        };
      }

      case 'text':
      case 'code': {
        const userNormalized = String(userAnswer).trim().toLowerCase().replace(/\s+/g, ' ');
        const correctArray = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];
        const isCorrect = correctArray.some(
          (c) => userNormalized === String(c).trim().toLowerCase().replace(/\s+/g, ' ')
        );

        return {
          isCorrect,
          feedback: isCorrect
            ? 'Input matches required protocol.'
            : 'Input does not match required system parameter.',
        };
      }

      case 'sequence': {
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
          return {
            isCorrect: false,
            feedback: 'Sequence format is invalid.',
          };
        }
        const correctArray = question.correctAnswer as any[];
        const isCorrect =
          userAnswer.length === correctArray.length &&
          userAnswer.every((val, idx) => String(val).trim() === String(correctArray[idx]).trim());

        return {
          isCorrect,
          feedback: isCorrect
            ? 'Sequence matches the required hardware order.'
            : 'Sequence order is incorrect.',
        };
      }

      default:
        return {
          isCorrect: false,
          feedback: 'Unsupported question type.',
        };
    }
  }

  /**
   * Validates whether an interaction is allowed in the current stage
   */
  public static validateInteractionAvailability(
    currentStage: StageDefinition,
    interaction: InteractionDefinition,
    unlockedObjects: string[]
  ): { isAllowed: boolean; reason?: string } {
    // 1. Must belong to current stage
    if (interaction.stageId !== currentStage.id) {
      return {
        isAllowed: false,
        reason: `Interaction belongs to ${interaction.stageId}, but active stage is ${currentStage.id}.`,
      };
    }

    // 2. Check if the target object is locked
    if (interaction.targetObjectId && !unlockedObjects.includes(interaction.targetObjectId)) {
      // If the object isn't in unlocked list and the interaction has unlock conditions
      if (interaction.unlockConditions && interaction.unlockConditions.length > 0) {
        return {
          isAllowed: false,
          reason: `Target object "${interaction.targetObjectId}" is currently locked. Complete prior stage objectives to unlock it.`,
        };
      }
    }

    return { isAllowed: true };
  }
}
