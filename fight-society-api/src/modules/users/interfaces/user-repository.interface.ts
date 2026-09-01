import { User } from '@prisma/client';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  deactivate(id: string): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
