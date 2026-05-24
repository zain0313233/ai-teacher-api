import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Upload official content
  @Post('content/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOfficialContent(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.uploadOfficialContent(file, body, req.user.id);
  }

  // Get all users
  @Get('users')
  async getAllUsers(
    @Query('role') role: string,
    @Query('search') search: string,
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getAllUsers(role, search);
  }

  // Update user role
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: string,
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.updateUserRole(userId, role);
  }

  // Delete user (non-admin only)
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.adminService.deleteUser(userId);
  }

  // Get pending content for verification
  @Get('verification/pending')
  async getPendingContent(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getPendingContent();
  }

  // Verify content
  @Patch('verification/:id/approve')
  async approveContent(@Param('id') documentId: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.approveContent(documentId);
  }

  // Reject content
  @Patch('verification/:id/reject')
  async rejectContent(@Param('id') documentId: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.rejectContent(documentId);
  }

  // Get system stats
  @Get('stats')
  async getSystemStats(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getSystemStats();
  }

  // Get system settings
  @Get('settings')
  async getSettings(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getSettings();
  }

  // Update system settings
  @Patch('settings')
  async updateSettings(@Body() settings: any, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.updateSettings(settings);
  }

  // List all official uploaded content
  @Get('content')
  async getOfficialContent(
    @Query('subject') subject: string,
    @Query('documentType') documentType: string,
    @Query('search') search: string,
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.adminService.getOfficialContent({ subject, documentType, search });
  }

  // Reprocess official content (same Supabase file, refresh Pinecone + metadata)
  @Post('content/:id/reprocess')
  async reprocessOfficialContent(@Param('id') documentId: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.adminService.reprocessOfficialContent(documentId);
  }

  // Delete official content
  @Delete('content/:id')
  async deleteOfficialContent(@Param('id') documentId: string, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.adminService.deleteOfficialContent(documentId);
  }

  // Start content scraping
  @Post('scraping/start')
  async startScraping(
    @Body() body: { subject: string; tier: string },
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.startScraping(body.subject, body.tier);
  }

  // Get scraping jobs
  @Get('scraping/jobs')
  async getScrapingJobs(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getScrapingJobs();
  }

  // Get scraped content stats
  @Get('scraping/stats')
  async getScrapingStats(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return this.adminService.getScrapingStats();
  }
}
