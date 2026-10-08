import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const ALS = new AsyncLocalStorage<Map<string, any>>();

@Global()
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: ALS,
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule {}
