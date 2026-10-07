import { Request, Response } from 'express';
import { MissionModel } from '../models/Mission';
import { ProgressModel } from '../models/Progress';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { MissionEngine } from '../services/mission/MissionEngine';
import { io } from '../server';

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

    // Initialize or resolve progress through the authoritative mission engine
    const missionState = await MissionEngine.getMissionState(student._id.toString(), mission.slug);

    res.status(200).json({
      success: true,
      data: missionState,
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

export async function getMissionState(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { missionId } = req.params;
    const studentId = req.user!._id.toString();

    const state = await MissionEngine.getMissionState(studentId, missionId);

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MISSION_STATE_FAILED',
        message: error.message || 'Failed to fetch mission gameplay state',
      },
    });
  }
}

export async function processInteraction(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { missionId, interactionId } = req.params;
    const studentId = req.user!._id.toString();
    const payload = req.body?.payload || {};

    const { result, missionState, events } = await MissionEngine.processInteraction(
      studentId,
      missionId,
      interactionId,
      payload
    );

    // Emit realtime events to connected clients via Socket.IO
    if (io && events.length > 0) {
      events.forEach((event) => {
        io.emit('mission:event', event);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        result,
        missionState,
        events,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INTERACTION_FAILED',
        message: error.message || 'Interaction could not be processed',
      },
    });
  }
}

export async function useHint(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { missionId, hintId } = req.params;
    const studentId = req.user!._id.toString();

    const { hint, missionState, events } = await MissionEngine.useHint(
      studentId,
      missionId,
      hintId
    );

    if (io && events.length > 0) {
      events.forEach((event) => {
        io.emit('mission:event', event);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hint,
        missionState,
        events,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'USE_HINT_FAILED',
        message: error.message || 'Failed to unlock hint',
      },
    });
  }
}
