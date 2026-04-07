import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto & { userId: string }) {
    return this.prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId: userId, deletedAt: null },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, userId: string, data: UpdateCategoryDto) {
    await this.findOne(id, userId);

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
