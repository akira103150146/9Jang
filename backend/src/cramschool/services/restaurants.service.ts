import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  Restaurant,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async getRestaurants(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [results, count] = await Promise.all([
      this.prisma.cramschoolRestaurant.findMany({
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.cramschoolRestaurant.count(),
    ]);

    return createPaginatedResponse(
      results.map((r) => this.toRestaurantDto(r)),
      count,
      page,
      pageSize,
    );
  }

  async getRestaurant(id: number): Promise<Restaurant> {
    const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.toRestaurantDto(restaurant);
  }

  async createRestaurant(createDto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.prisma.cramschoolRestaurant.create({
      data: {
        name: createDto.name,
        phone: createDto.phone || null,
        address: createDto.address || null,
        menuImagePath: createDto.menu_image_path || null,
        isActive: createDto.is_active !== undefined ? createDto.is_active : true,
      },
    });

    return this.toRestaurantDto(restaurant);
  }

  async updateRestaurant(id: number, updateDto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    const updatedRestaurant = await this.prisma.cramschoolRestaurant.update({
      where: { restaurantId: id },
      data: {
        name: updateDto.name,
        phone: updateDto.phone !== undefined ? updateDto.phone : undefined,
        address: updateDto.address !== undefined ? updateDto.address : undefined,
        menuImagePath: updateDto.menu_image_path !== undefined ? updateDto.menu_image_path : undefined,
        isActive: updateDto.is_active !== undefined ? updateDto.is_active : undefined,
      },
    });

    return this.toRestaurantDto(updatedRestaurant);
  }

  async deleteRestaurant(id: number): Promise<void> {
    const restaurant = await this.prisma.cramschoolRestaurant.findUnique({
      where: { restaurantId: id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    await this.prisma.cramschoolRestaurant.delete({
      where: { restaurantId: id },
    });
  }

  private toRestaurantDto(restaurant: any): Restaurant {
    return {
      restaurant_id: restaurant.restaurantId,
      name: restaurant.name,
      phone: restaurant.phone || null,
      address: restaurant.address || null,
      menu_image_path: restaurant.menuImagePath || null,
      is_active: restaurant.isActive,
      created_at: restaurant.createdAt?.toISOString(),
      updated_at: restaurant.updatedAt?.toISOString(),
    };
  }
}
