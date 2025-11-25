import { Injectable } from '@nestjs/common';

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaService {
  private users_list: User[] = [];
  private userIdCounter = 1;

  // User operations
  async user(where: { id?: number; email?: string }): Promise<User | null> {
    if (where.id) {
      return this.users_list.find((u) => u.id === where.id) || null;
    }
    if (where.email) {
      return this.users_list.find((u) => u.email === where.email) || null;
    }
    return null;
  }

  async getUsers(): Promise<User[]> {
    return this.users_list;
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<User> {
    const newUser: User = {
      id: this.userIdCounter++,
      email: data.email,
      name: data.name,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users_list.push(newUser);
    return newUser;
  }

  async updateUser(
    where: { id: number },
    data: Partial<{ email: string; name: string; password: string }>,
  ): Promise<User> {
    const user = this.users_list.find((u) => u.id === where.id);
    if (!user) {
      throw new Error(`User with id ${where.id} not found`);
    }
    Object.assign(user, data, { updatedAt: new Date() });
    return user;
  }

  async deleteUser(where: { id: number }): Promise<User> {
    const index = this.users_list.findIndex((u) => u.id === where.id);
    if (index === -1) {
      throw new Error(`User with id ${where.id} not found`);
    }
    const [deletedUser] = this.users_list.splice(index, 1);
    return deletedUser;
  }
}
