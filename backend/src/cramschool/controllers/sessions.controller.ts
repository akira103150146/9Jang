import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SessionsService } from '../services/sessions.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  Session,
  CreateSessionSchema,
  UpdateSessionSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('courses')
@Controller('cramschool/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得課堂列表', description: '分頁取得課堂記錄' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  async getSessions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.sessionsService.getSessions(page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一課堂', description: '查詢課堂詳細資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '課堂不存在' })
  async getSession(@Param('id', ParseIntPipe) id: number): Promise<Session> {
    return this.sessionsService.getSession(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立課堂', description: '新增課堂記錄' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createSession(
    @Body(new ZodValidationPipe(CreateSessionSchema)) createDto: CreateSessionDto,
  ): Promise<Session> {
    return this.sessionsService.createSession(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新課堂', description: '修改課堂資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '課堂不存在' })
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateSessionSchema)) updateDto: UpdateSessionDto,
  ): Promise<Session> {
    return this.sessionsService.updateSession(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除課堂', description: '刪除課堂記錄' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '課堂不存在' })
  async deleteSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionsService.deleteSession(id);
  }
}
