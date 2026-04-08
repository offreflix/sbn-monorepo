import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FoodsRepository } from './foods.repository';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(private readonly foodsRepository: FoodsRepository) {}

  create(userId: string, dto: CreateFoodDto) {
    return this.foodsRepository.create({ ...dto, isCustom: true, userId });
  }

  findAll(userId: string, search?: string) {
    return this.foodsRepository.findAllVisible(userId, search);
  }

  async findOne(id: string, userId: string) {
    const food = await this.foodsRepository.findById(id);
    if (!food) throw new NotFoundException('Food not found');
    if (food.userId !== null && food.userId !== userId) {
      throw new NotFoundException('Food not found');
    }
    return food;
  }

  async update(id: string, userId: string, dto: UpdateFoodDto) {
    const food = await this.foodsRepository.findById(id);
    if (!food) throw new NotFoundException('Food not found');
    if (!food.isCustom || food.userId === null) {
      throw new ForbiddenException('Public foods cannot be modified');
    }
    if (food.userId !== userId) {
      throw new NotFoundException('Food not found');
    }
    return this.foodsRepository.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const food = await this.foodsRepository.findById(id);
    if (!food) throw new NotFoundException('Food not found');
    if (!food.isCustom || food.userId === null) {
      throw new ForbiddenException('Public foods cannot be deleted');
    }
    if (food.userId !== userId) {
      throw new NotFoundException('Food not found');
    }
    return this.foodsRepository.remove(id);
  }
}
