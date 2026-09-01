import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  IUserRepository,
  USER_REPOSITORY,
} from './interfaces/user-repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll() {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(
    id: string,
    data: { name?: string; phone?: string; cpf?: string },
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.cpf && data.cpf !== user.cpf) {
      const existingCpf = await this.userRepository.findAll();
      const cpfTaken = existingCpf.some(
        (u) => u.cpf === data.cpf && u.id !== id,
      );
      if (cpfTaken) {
        throw new ConflictException('CPF already registered');
      }
    }

    const updated = await this.userRepository.update(id, data);
    return this.sanitizeUser(updated);
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(id, { passwordHash });

    return { message: 'Password updated successfully' };
  }

  async updateRole(id: string, role: Role) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(id, { role });
    return this.sanitizeUser(updated);
  }

  async deactivate(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
