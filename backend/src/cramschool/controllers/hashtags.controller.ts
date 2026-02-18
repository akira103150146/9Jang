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
import { HashtagsService } from '../services/hashtags.service';
import {
  CreateHashtagDto,
  UpdateHashtagDto,
  Hashtag,
  CreateHashtagSchema,
  UpdateHashtagSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard'
import { PermissionGuard, Permission } from '../../common/guards/permission.guard';;

@Controller('cramschool/hashtags')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get()
  @Permission({ resource: '/cramschool/hashtags' })
  async getHashtags(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.hashtagsService.getHashtags(page, pageSize);
  }

  @Get(':id')
  @Permission({ resource: '/cramschool/hashtags' })
  async getHashtag(@Param('id', ParseIntPipe) id: number): Promise<Hashtag> {
    return this.hashtagsService.getHashtag(id);
  }

  @Post()
  @Permission({ resource: '/cramschool/hashtags' })
  async createHashtag(
    @Body(new ZodValidationPipe(CreateHashtagSchema)) createDto: CreateHashtagDto,
  ): Promise<Hashtag> {
    return this.hashtagsService.createHashtag(createDto);
  }

  @Put(':id')
  @Permission({ resource: '/cramschool/hashtags' })
  async updateHashtag(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateHashtagSchema)) updateDto: UpdateHashtagDto,
  ): Promise<Hashtag> {
    return this.hashtagsService.updateHashtag(id, updateDto);
  }

  @Delete(':id')
  @Permission({ resource: '/cramschool/hashtags' })
  async deleteHashtag(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.hashtagsService.deleteHashtag(id);
  }
}
