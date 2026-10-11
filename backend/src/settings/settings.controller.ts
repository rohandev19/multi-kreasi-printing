import { Controller, Get, Body, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('api/v1/settings')
@UseGuards(VerifiedGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions({ action: 'manage', subject: 'Settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @RequirePermissions({ action: 'manage', subject: 'Settings' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @RequirePermissions({ action: 'manage', subject: 'Settings' })
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    // If it's the main app_settings, we can theoretically add extra validation here
    // but the DTO handles basic validation of the incoming structure.
    return this.settingsService.update(key, dto.value, dto.description);
  }
}
