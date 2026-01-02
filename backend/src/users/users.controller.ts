import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { SearchUsersUseCase } from './use-cases/search-users.usecase';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('api/v1/users')
@Roles('Owner', 'Manager')
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private searchUsersUseCase: SearchUsersUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.createUserUseCase.execute(dto, userId);
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
}
