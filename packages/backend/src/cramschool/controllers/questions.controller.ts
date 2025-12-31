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
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQuery,
  Question,
  QuestionQuerySchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getQuestions(
    @Query(new ZodValidationPipe(QuestionQuerySchema)) query: QuestionQuery,
    @Request() req,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.getQuestions(query, user.id, userRecord?.role || 'STUDENT');
  }

  @Get(':id')
  async getQuestion(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.questionsService.getQuestion(id);
  }

  @Post()
  async createQuestion(
    @Body(new ZodValidationPipe(CreateQuestionSchema)) createDto: CreateQuestionDto,
    @Request() req,
  ): Promise<Question> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.createQuestion(createDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Put(':id')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateQuestionSchema)) updateDto: UpdateQuestionDto,
    @Request() req,
  ): Promise<Question> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.updateQuestion(id, updateDto, user.id, userRecord?.role || 'STUDENT');
  }

  @Delete(':id')
  async deleteQuestion(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    return this.questionsService.deleteQuestion(id, userRecord?.role || 'STUDENT');
  }
}
