import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { SearchUsersUseCase } from './use-cases/search-users.usecase';
import { GetRolesUseCase } from './use-cases/get-roles.usecase';
import { ExportUserDataUseCase } from './use-cases/export-user-data.usecase';
import { DeleteUserAccountUseCase } from './use-cases/delete-user-account.usecase';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@Roles('Owner', 'Manager')
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private searchUsersUseCase: SearchUsersUseCase,
    private getRolesUseCase: GetRolesUseCase,
    private exportUserDataUseCase: ExportUserDataUseCase,
    private deleteUserAccountUseCase: DeleteUserAccountUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.createUserUseCase.execute(dto, userId);
  }

  @Get('roles')
  async getRoles() {
    return this.getRolesUseCase.execute();
  }

  @Get()
  async search(@Query() query: SearchUsersDto) {
    return this.searchUsersUseCase.execute(query);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.updateUserUseCase.execute(id, dto, userId);
  }

  // NOTE: In a real scenario, these endpoints might need to bypass the @Roles('Owner', 'Manager') guard
  // so any logged-in user can delete/export their own data. But for this MVP, we place them here.
  // We can override the role requirement for these specific endpoints if needed by NestJS roles mechanisms.
  @Get('me/export')
  @Roles()
  async exportData(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.exportUserDataUseCase.execute(userId);
  }

  @Delete('me')
  @Roles()
  async deleteAccount(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.deleteUserAccountUseCase.execute(userId);
  }
}
