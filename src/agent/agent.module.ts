import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { Customer, CustomerSchema } from '../customer/schemas/customer.schema';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [
    HttpModule,
    AiModule,
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
  ],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
