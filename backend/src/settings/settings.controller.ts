import { Controller, Get, Body, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';

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
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    // If it's the main app_settings, we can theoretically add extra validation here
    // but the DTO handles basic validation of the incoming structure.
    return this.settingsService.update(key, dto.value, dto.description);
  }
}
