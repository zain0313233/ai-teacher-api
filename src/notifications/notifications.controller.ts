import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  updatePreferences(@Request() req, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }

  @Get()
  list(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.listForUser(
      req.user.id,
      limit ? parseInt(limit, 10) : 30,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  async unreadCount(@Request() req) {
    const res = await this.notificationsService.listForUser(req.user.id, 1, true);
    return { success: true, unreadCount: res.unreadCount };
  }

  @Patch(':id/read')
  markRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Post('read-all')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}
