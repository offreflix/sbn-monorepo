import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
  }) {
    return this.prisma.category.create({
      data: {
        user_id: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { user_id: userId },
    });
  }
}
