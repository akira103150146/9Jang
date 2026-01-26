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
import { RestaurantsService } from '../services/restaurants.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  Restaurant,
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@Controller('cramschool/restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getRestaurants(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    const user = req.user;
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });
    // 管理員不可用
    if (userRecord?.role === 'ADMIN') {
      return { count: 0, results: [], page: 1, page_size: pageSize };
    }
    return this.restaurantsService.getRestaurants(page, pageSize);
  }

  @Get(':id')
  async getRestaurant(@Param('id', ParseIntPipe) id: number): Promise<Restaurant> {
    return this.restaurantsService.getRestaurant(id);
  }

  @Post()
  async createRestaurant(
    @Body(new ZodValidationPipe(CreateRestaurantSchema)) createDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.createRestaurant(createDto);
  }

  @Put(':id')
  async updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateRestaurantSchema)) updateDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.updateRestaurant(id, updateDto);
  }

  @Delete(':id')
  async deleteRestaurant(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.restaurantsService.deleteRestaurant(id);
  }
}
