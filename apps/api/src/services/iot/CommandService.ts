import { IoTCommand, IoTCommandInput, ioTCommandSchema } from '@missionx/shared';
import { IoTService } from './IoTService';
import { IoTRegistry } from './IoTRegistry';

export class CommandService {
  /**
   * Validates and executes an IoT command with role-based permission enforcement
   */
  public static async executeCommand(
    input: IoTCommandInput,
    userRole: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. Zod schema validation
    const parsed = ioTCommandSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      };
    }

    const { deviceId, command, value } = parsed.data;

    // 2. Validate device existence
    if (!IoTRegistry.hasDevice(deviceId)) {
      const err: any = new Error(`Unknown IoT device: ${deviceId}`);
      err.code = 'DEVICE_NOT_FOUND';
      throw err;
    }

    // 3. Access Control: Students cannot alter raw physics/simulation debug modes
    const adminOnlyCommands = [
      'SET_SIMULATION_MODE',
      'SET_TEMPERATURE',
      'SET_HUMIDITY',
      'SET_WATER',
    ];

    if (userRole !== 'ADMIN' && adminOnlyCommands.includes(command)) {
      const err: any = new Error(`Command '${command}' requires ADMIN security clearance.`);
      err.code = 'FORBIDDEN';
      throw err;
    }

    const fullCommand: IoTCommand = {
      deviceId,
      command,
      value,
      issuedBy: userId,
      timestamp: new Date().toISOString(),
    };

    return await IoTService.sendCommand(deviceId, fullCommand);
  }
}
