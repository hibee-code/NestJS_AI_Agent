import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from './agent/agent.module';
import { PoliciesModule } from './policies/policies.module';
import { CustomerModule } from './customer/customer.module';


@Module({
imports: [
MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance'),
AgentModule,
CustomerModule,
PoliciesModule,
],
})
export class AppModule {}