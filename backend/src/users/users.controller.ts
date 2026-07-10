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
  NotFoundException,
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
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

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
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
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
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.updateUserUseCase.execute(id, dto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Omit passwordHash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    // We should technically use a UseCase, but for brevity we'll soft/hard delete directly here,
    // or just call prisma.
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  // NOTE: In a real scenario, these endpoints might need to bypass the @Roles('Owner', 'Manager') guard
  // so any logged-in user can delete/export their own data. But for this MVP, we place them here.
  // We can override the role requirement for these specific endpoints if needed by NestJS roles mechanisms.
  @Get('me/export')
  @Roles()
  async exportData(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.exportUserDataUseCase.execute(userId);
  }

  @Delete('me')
  @Roles()
  async deleteAccount(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.deleteUserAccountUseCase.execute(userId);
  }
}
