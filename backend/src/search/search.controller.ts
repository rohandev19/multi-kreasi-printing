import { Controller, Get, Query, Req } from '@nestjs/common';
import { GlobalSearchUseCase } from './use-cases/global-search.usecase';
import { GlobalSearchDto } from './dto/global-search.dto';
import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  role: string;
  email: string;
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly globalSearchUseCase: GlobalSearchUseCase) {}

  @Get()
  async search(
    @Query() dto: GlobalSearchDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.globalSearchUseCase.execute(dto, req.user);
  }
}
