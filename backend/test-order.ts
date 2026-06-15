import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CreateOrderUseCase } from './src/orders/use-cases/create-order.usecase';

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const useCase = app.get(CreateOrderUseCase);
    
    const dto = {
      items: [{ productId: '61353365-2a6c-49b0-9149-e8107fbc72e7', quantity: 3 }],
      priority: 'Normal'
    };
    
    const res = await useCase.execute(dto, 'c4103259-cbcb-4ce5-8311-23dcb647d164');
    console.log('SUCCESS:', res.id);
  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  }
  process.exit(0);
}
bootstrap();
