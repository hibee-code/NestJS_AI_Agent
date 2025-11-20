import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { GlobalValidationPipe } from './pipes/global-validation';
import { Logger } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { AppModule } from './app.module';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-agent')
  .then(() => console.log('MongoDB manual connect: SUCCESS'))
  .catch(err => console.error('MongoDB manual connect FAILED:', err));

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new GlobalValidationPipe());
    app.enableShutdownHooks();

//     mongoose.connection.on('error', err => {
//     console.error('❌ MongoDB connection error:', err);
// });

    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
    logger.log(`Listening on http://localhost:${port}/api`);

    const graceful = async () => {
      logger.log('Shutting down...');
      try {
        await app.close();
        await mongoose.disconnect();
        logger.log('Shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown', err as any);
        process.exit(1);
      }
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
  } catch (err) {
    logger.error('Bootstrap failed', err as any);
    process.exit(1);
  }
}

bootstrap();