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
import { QuestionTagsService } from '../services/question-tags.service';
import {
  CreateQuestionTagDto,
  UpdateQuestionTagDto,
  QuestionTag,
  CreateQuestionTagSchema,
  UpdateQuestionTagSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/question-tags')
@UseGuards(JwtAuthGuard)
export class QuestionTagsController {
  constructor(private readonly questionTagsService: QuestionTagsService) {}

  @Get()
  async getQuestionTags(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.questionTagsService.getQuestionTags(page, pageSize);
  }

  @Get(':id')
  async getQuestionTag(@Param('id', ParseIntPipe) id: number): Promise<QuestionTag> {
    return this.questionTagsService.getQuestionTag(id);
  }

  @Post()
  async createQuestionTag(
    @Body(new ZodValidationPipe(CreateQuestionTagSchema)) createDto: CreateQuestionTagDto,
  ): Promise<QuestionTag> {
    return this.questionTagsService.createQuestionTag(createDto);
  }

  @Put(':id')
  async updateQuestionTag(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateQuestionTagSchema)) updateDto: UpdateQuestionTagDto,
  ): Promise<QuestionTag> {
    return this.questionTagsService.updateQuestionTag(id, updateDto);
  }

  @Delete(':id')
  async deleteQuestionTag(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.questionTagsService.deleteQuestionTag(id);
  }
}
