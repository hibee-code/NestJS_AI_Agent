import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './schemas/customer.schema';


@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async getTopCustomersByPolicies(limit: number = 5) {
    return this.customerModel
      .find()
      .sort({ totalPolicies: -1 })
      .limit(limit)
      .exec();
  }

  async getCustomerByEmail(email: string) {
    return this.customerModel.findOne({ email }).exec();
  }

  async getAllCustomers() {
    return this.customerModel.find().exec();
  }

  async getCustomerStats() {
    return this.customerModel.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          avgPolicies: { $avg: '$totalPolicies' },
          maxPolicies: { $max: '$totalPolicies' },
        },
      },
    ]);
  }
}