import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { SearchUsersUseCase } from './use-cases/search-users.usecase';

@Module({
  controllers: [UsersController],
  providers: [CreateUserUseCase, UpdateUserUseCase, SearchUsersUseCase],
})
export class UsersModule {}
