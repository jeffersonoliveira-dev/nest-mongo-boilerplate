import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3000;
  const env = configService.get<string>('NODE_ENV', 'development');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('BFF API')
    .setDescription('The BFF API description')
    .setVersion('1.0')
    .addTag('bff')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  process.env.MONGODB_URI =
    configService.getOrThrow('MONGODB_URI') ?? process.env.MONGODB_URI;
  process.env.MONGODB_NAME = configService.getOrThrow('MONGODB_NAME');

  const command = 'migrate-mongo up';
  const options = {
    env: process.env,
    cwd: './seed/',
  };

  exec(command, options, (error, stdout) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      process.exit(2);
    }
    console.info(stdout);
  });

  SwaggerModule.setup('api', app, document);
  await app.listen(port);
  console.info(
    '\n Application is running on: ' +
      `\n    * [http://localhost:${port}]` +
      '\n for environment: ' +
      `\n    * [${env}]`,
  );
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(2);
});
