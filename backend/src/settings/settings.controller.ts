import { Controller, Get, Body, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';

@Controller('api/v1/settings')
@UseGuards(VerifiedGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('Manager', 'Owner')
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @Roles('Manager', 'Owner')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @Roles('Manager', 'Owner')
  update(
    @Param('key') key: string,
    @Body('value') value: any,
    @Body('description') description?: string,
  ) {
    return this.settingsService.update(key, value, description);
  }
}
