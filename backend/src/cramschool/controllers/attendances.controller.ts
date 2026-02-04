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
import { AttendancesService } from '../services/attendances.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  Attendance,
  CreateAttendanceSchema,
  UpdateAttendanceSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('attendances')
@Controller('cramschool/attendances')
@UseGuards(JwtAuthGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得出席記錄列表', description: '分頁取得學生出席記錄' })
  @ApiQuery({ name: 'include_deleted', required: false, description: '是否包含已刪除', example: 'false', type: String })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功取得出席記錄列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getAttendances(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.attendancesService.getAttendances(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一出席記錄', description: '根據 ID 取得出席記錄詳細資料' })
  @ApiParam({ name: 'id', description: '出席記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '出席記錄不存在' })
  async getAttendance(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendancesService.getAttendance(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立出席記錄', description: '新增學生出席記錄（簽到）' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createAttendance(
    @Body(new ZodValidationPipe(CreateAttendanceSchema)) createDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendancesService.createAttendance(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新出席記錄', description: '修改出席記錄資料' })
  @ApiParam({ name: 'id', description: '出席記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '出席記錄不存在' })
  async updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAttendanceSchema)) updateDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendancesService.updateAttendance(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除出席記錄', description: '軟刪除出席記錄' })
  @ApiParam({ name: 'id', description: '出席記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '出席記錄不存在' })
  async deleteAttendance(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attendancesService.deleteAttendance(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '恢復出席記錄', description: '恢復已刪除的出席記錄' })
  @ApiParam({ name: 'id', description: '出席記錄 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '恢復成功',  })
  @ApiResponse({ status: 404, description: '出席記錄不存在' })
  async restoreAttendance(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendancesService.restoreAttendance(id);
  }
}
