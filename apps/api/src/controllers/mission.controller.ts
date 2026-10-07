import { Request, Response } from 'express';
import { MissionModel } from '../models/Mission';
import { ProgressModel } from '../models/Progress';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getMissions(req: Request, res: Response): Promise<void> {
  try {
    const missions = await MissionModel.find({ published: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: missions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MISSIONS_FAILED',
        message: error.message || 'Failed to fetch missions',
      },
    });
  }
}

export async function getMissionBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const mission = await MissionModel.findOne({ slug: slug.toLowerCase() });

    if (!mission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MISSION_NOT_FOUND',
          message: `Mission with slug '${slug}' was not found`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: mission,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MISSION_FAILED',
        message: error.message || 'Failed to fetch mission details',
      },
    });
  }
}

export async function startMission(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const student = req.user!;

    const mission = await MissionModel.findById(id);
    if (!mission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MISSION_NOT_FOUND',
          message: 'Mission not found',
        },
      });
      return;
    }

    // Check if progress already exists
    let progress = await ProgressModel.findOne({
      studentId: student._id,
      missionId: mission._id,
    });

    if (!progress) {
      progress = await ProgressModel.create({
        studentId: student._id,
        missionId: mission._id,
        currentStage: 1,
        completedStages: [],
        score: 0,
        attempts: 1,
        hintsUsed: 0,
        elapsedTime: 0,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      });

      // Increment student's missionsStarted counter
      await UserModel.findByIdAndUpdate(student._id, {
        $inc: { 'stats.missionsStarted': 1 },
      });
    } else if (progress.status === 'NOT_STARTED') {
      progress.status = 'IN_PROGRESS';
      progress.startedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'START_MISSION_FAILED',
        message: error.message || 'Failed to start mission',
      },
    });
  }
}
