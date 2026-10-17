import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { GlobalSearchUseCase } from './use-cases/global-search.usecase';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [GlobalSearchUseCase],
  exports: [GlobalSearchUseCase],
})
export class SearchModule {}
