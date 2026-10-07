import { RewardDefinition, GrantedRewardRecord } from '@missionx/shared';
import { IProgressDocument } from '../../models/Progress';
import { UserModel } from '../../models/User';

export class RewardService {
  /**
   * Applies rewards to student progress and updates user XP
   */
  public static async applyRewards(
    rewards: RewardDefinition[],
    progress: IProgressDocument,
    studentId: string
  ): Promise<GrantedRewardRecord[]> {
    const granted: GrantedRewardRecord[] = [];
    let xpToAdd = 0;
    let scoreToAdd = 0;

    for (const reward of rewards) {
      // Check if reward was already granted to prevent duplicates
      const alreadyGranted = progress.rewards.some((r) => r.id === reward.id);
      if (alreadyGranted) continue;

      const record: GrantedRewardRecord = {
        id: reward.id,
        type: reward.type,
        amount: reward.amount,
        value: reward.value,
        grantedAt: new Date().toISOString(),
      };

      if (reward.type === 'XP' && reward.amount) {
        xpToAdd += reward.amount;
      } else if (reward.type === 'SCORE' && reward.amount) {
        scoreToAdd += reward.amount;
      } else if (reward.type === 'CLUE' && reward.value) {
        // Automatically reveal clue in student progress
        progress.revealedClues.push({
          clueId: reward.id,
          text: reward.value,
          revealedAt: new Date().toISOString(),
        });
      }

      progress.rewards.push(record);
      granted.push(record);
    }

    if (scoreToAdd > 0) {
      progress.score += scoreToAdd;
    }

    if (xpToAdd > 0) {
      await UserModel.findByIdAndUpdate(studentId, {
        $inc: { 'stats.xp': xpToAdd },
      });
    }

    return granted;
  }
}
