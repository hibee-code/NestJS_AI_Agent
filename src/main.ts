import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { GlobalValidationPipe } from './pipes/global-validation';


dotenv.config();
async function bootstrap() {
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new GlobalValidationPipe());
await app.listen(process.env.PORT || 3000);
}() {
dotenv.config();
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
await app.listen(process.env.PORT || 3000);
console.log(`Listening on ${process.env.PORT || 3000}`);
}

bootstrap();