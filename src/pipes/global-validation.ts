import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validateSchema } from '../utils/validator.util';


@Injectable()
export class GlobalValidationPipe implements PipeTransform {
transform(value: any) {
const error = validateSchema(value);
if (error) throw new BadRequestException(error);
return value;
}
}