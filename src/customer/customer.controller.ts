import { Controller, Post, Body, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customer')
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	@Post()
	async createCustomer(@Body() dto: CreateCustomerDto) {
		return this.customerService.createCustomer(dto);
	}

	@Get()
	async getAll() {
		return this.customerService.getAllCustomers();
	}
}
