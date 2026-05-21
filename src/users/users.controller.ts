import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.getProfile(req.user.id);
    return {
      success: true,
      user,
    };
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
    return {
      success: true,
      user,
    };
  }

  @Get('me/profile')
  async getMyProfile(@Request() req) {
    const profile = await this.usersService.getMyProfile(req.user.id);
    return { success: true, ...profile };
  }

  @Patch('me/profile')
  async updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.usersService.updateMyProfile(req.user.id, updateProfileDto);
    return { success: true, ...profile };
  }

  @Patch('plan')
  async updatePlan(@Request() req, @Body() updatePlanDto: UpdatePlanDto) {
    const user = await this.usersService.updatePlan(
      req.user.id,
      updatePlanDto.plan,
    );
    return {
      success: true,
      user,
    };
  }
}
