
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AgentModule } from './agent/agent.module';
import { CustomerModule } from './customer/customer.module';
import { PoliciesModule } from './policies/policies.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get('MONGODB_URI');

        console.log('🔍 Connecting to MongoDB:', uri);

        return {
          uri,
          connectionFactory: (connection) => {
            connection.on('connected', () => console.log('✅ MongoDB Connected'));
            connection.on('error', (err) => console.error('❌ MongoDB Error:', err));
            return connection;
          },
        };
      },
    }),

    AgentModule,
    CustomerModule,
    PoliciesModule,
  ],

  controllers: [HealthController],
})
export class AppModule {}
