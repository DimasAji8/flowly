import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Service info' })
  @ApiResponse({ status: 200, description: 'Nama service & status' })
  getRoot(): { name: string; status: string } {
    return { name: 'flowly-api', status: 'ok' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Status server & timestamp' })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Cek koneksi database' })
  @ApiResponse({ status: 200, description: 'Status koneksi database' })
  @ApiResponse({ status: 503, description: 'Koneksi database bermasalah' })
  async getDbHealth(): Promise<{ status: string; database: string }> {
    return this.appService.getDbHealth();
  }
}
