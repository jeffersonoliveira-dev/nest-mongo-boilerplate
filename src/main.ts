import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('BFF API')
    .setDescription('The BFF API description')
    .setVersion('1.0')
    .addTag('bff')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  console.log(`HTTP Rest API listening on port ${port}.`);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
