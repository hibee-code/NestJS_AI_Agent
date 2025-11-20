import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

/**
 * GlobalValidationPipe provides centralized validation settings.
 * Adjust options below to change transform/whitelist/forbid behavior.
 */
export class GlobalValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      // convert payloads to DTO instances
      transform: true,
      // strip properties that do not have any decorators
      whitelist: true,
      // throw on unknown properties (set to false if you allow extras)
      forbidNonWhitelisted: false,
      // provide detailed errors
      disableErrorMessages: false,
      ...(options || {}),
    });
  }
}