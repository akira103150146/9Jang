import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
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

@ApiTags('orders')
@Controller('cramschool/restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得餐廳列表', description: '分頁取得所有可訂餐的餐廳資料（管理員無法使用）' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1, type: Number })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10, type: Number })
  @ApiResponse({ status: 200, description: '成功取得餐廳列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getRestaurants(
    @Request() req: AuthRequest,
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一餐廳', description: '根據餐廳 ID 取得詳細資料和菜單' })
  @ApiParam({ name: 'id', description: '餐廳 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '成功',  })
  @ApiResponse({ status: 404, description: '餐廳不存在' })
  async getRestaurant(@Param('id', ParseIntPipe) id: number): Promise<Restaurant> {
    return this.restaurantsService.getRestaurant(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立餐廳', description: '新增餐廳資料到系統' })
  @ApiResponse({ status: 201, description: '建立成功',  })
  @ApiResponse({ status: 400, description: '資料驗證失敗' })
  async createRestaurant(
    @Body(new ZodValidationPipe(CreateRestaurantSchema)) createDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.createRestaurant(createDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新餐廳', description: '修改餐廳資料和菜單' })
  @ApiParam({ name: 'id', description: '餐廳 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '更新成功',  })
  @ApiResponse({ status: 404, description: '餐廳不存在' })
  async updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateRestaurantSchema)) updateDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantsService.updateRestaurant(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除餐廳', description: '刪除餐廳資料' })
  @ApiParam({ name: 'id', description: '餐廳 ID', example: 1, type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '餐廳不存在' })
  async deleteRestaurant(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.restaurantsService.deleteRestaurant(id);
  }
}
