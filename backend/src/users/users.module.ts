import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { SearchUsersUseCase } from './use-cases/search-users.usecase';
import { ExportUserDataUseCase } from './use-cases/export-user-data.usecase';
import { DeleteUserAccountUseCase } from './use-cases/delete-user-account.usecase';
import { GetRolesUseCase } from './use-cases/get-roles.usecase';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    SearchUsersUseCase,
    ExportUserDataUseCase,
    DeleteUserAccountUseCase,
    GetRolesUseCase,
  ],
})
export class UsersModule {}
