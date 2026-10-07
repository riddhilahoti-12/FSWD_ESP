import { Response } from 'express';
import { ProgressModel } from '../models/Progress';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { missionId } = req.params;
    const studentId = req.user!._id;

    const progress = await ProgressModel.findOne({
      studentId,
      missionId,
    }).populate('missionId');

    res.status(200).json({
      success: true,
      data: progress || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROGRESS_FAILED',
        message: error.message || 'Failed to fetch mission progress',
      },
    });
  }
}

export async function getMyProgressList(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!._id;

    const progressList = await ProgressModel.find({
      studentId,
    })
      .populate('missionId')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: progressList,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROGRESS_LIST_FAILED',
        message: error.message || 'Failed to fetch student progress list',
      },
    });
  }
}
