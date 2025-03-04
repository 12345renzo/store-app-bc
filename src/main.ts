import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuración de CORS
  app.enableCors({
    origin: 'https://store-app-fr.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-token'],
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
