import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { playwrightManager } from './BrowserManager';

const corsOptions = {
  origin: true, // 允许的前端应用源
  credentials: true, // 允许携带凭据
  allowedHeaders:
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  methods: 'GET, POST, OPTIONS, PUT, DELETE',
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsOptions);
  await playwrightManager.start();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
});
