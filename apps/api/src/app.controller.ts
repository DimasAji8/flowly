import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Service info' })
  getRoot(): { name: string; status: string } {
    return { name: 'flowly-api', status: 'ok' };
  }

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Cek koneksi database' })
  async getDbHealth(): Promise<{ status: string; database: string }> {
    return this.appService.getDbHealth();
  }
}
