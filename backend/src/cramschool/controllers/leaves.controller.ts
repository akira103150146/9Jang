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
import { LeavesService } from '../services/leaves.service';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  Leave,
  CreateLeaveSchema,
  UpdateLeaveSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  async getLeaves(
    @Query('include_deleted') includeDeleted: string = 'false',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.leavesService.getLeaves(includeDeleted === 'true', page, pageSize);
  }

  @Get(':id')
  async getLeave(@Param('id', ParseIntPipe) id: number): Promise<Leave> {
    return this.leavesService.getLeave(id);
  }

  @Post()
  async createLeave(
    @Body(new ZodValidationPipe(CreateLeaveSchema)) createDto: CreateLeaveDto,
  ): Promise<Leave> {
    return this.leavesService.createLeave(createDto);
  }

  @Put(':id')
  async updateLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateLeaveSchema)) updateDto: UpdateLeaveDto,
  ): Promise<Leave> {
    return this.leavesService.updateLeave(id, updateDto);
  }

  @Delete(':id')
  async deleteLeave(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leavesService.deleteLeave(id);
  }

  @Post(':id/restore')
  async restoreLeave(@Param('id', ParseIntPipe) id: number): Promise<Leave> {
    return this.leavesService.restoreLeave(id);
  }
}
