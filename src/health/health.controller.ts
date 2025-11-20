import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  health() {
    const state = this.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: state === 1 ? 'up' : 'down',
      mongo: {
        readyState: state,
        state: stateMap[state] || 'unknown',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
