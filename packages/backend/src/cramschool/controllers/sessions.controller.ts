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

@Controller('cramschool/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getSessions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.sessionsService.getSessions(page, pageSize);
  }

  @Get(':id')
  async getSession(@Param('id', ParseIntPipe) id: number): Promise<Session> {
    return this.sessionsService.getSession(id);
  }

  @Post()
  async createSession(
    @Body(new ZodValidationPipe(CreateSessionSchema)) createDto: CreateSessionDto,
  ): Promise<Session> {
    return this.sessionsService.createSession(createDto);
  }

  @Put(':id')
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateSessionSchema)) updateDto: UpdateSessionDto,
  ): Promise<Session> {
    return this.sessionsService.updateSession(id, updateDto);
  }

  @Delete(':id')
  async deleteSession(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionsService.deleteSession(id);
  }
}
