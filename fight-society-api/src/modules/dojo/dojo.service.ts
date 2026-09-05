import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DojoService {
  constructor(private readonly prisma: PrismaService) {}

  find() {
    return this.prisma.dojoDescription.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  async save(description: string) {
    const normalizedDescription = description.trim();
    if (!normalizedDescription) {
      throw new BadRequestException('A descrição do dojo não pode ser vazia');
    }

    const current = await this.find();

    if (current) {
      return this.prisma.dojoDescription.update({
        where: { id: current.id },
        data: { description: normalizedDescription },
      });
    }

    return this.prisma.dojoDescription.create({
      data: { description: normalizedDescription },
    });
  }

  async update(id: string, description: string) {
    const normalizedDescription = description.trim();
    if (!normalizedDescription) {
      throw new BadRequestException('A descrição do dojo não pode ser vazia');
    }

    const current = await this.prisma.dojoDescription.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Descrição do dojo não encontrada');
    }

    return this.prisma.dojoDescription.update({
      where: { id },
      data: { description: normalizedDescription },
    });
  }

  async remove(id: string) {
    const current = await this.prisma.dojoDescription.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Descrição do dojo não encontrada');
    }

    return this.prisma.dojoDescription.delete({ where: { id } });
  }
}
