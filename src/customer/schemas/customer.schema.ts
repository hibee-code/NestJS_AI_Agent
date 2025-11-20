import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    type: [
      {
        policyNumber: { type: String, required: true },
        type: { type: String, required: true },
        coverageAmount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  policies: {
    policyNumber: string;
    type: string;
    coverageAmount: number;
  }[];

  @Prop({ default: 0 })
  totalPolicies: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
