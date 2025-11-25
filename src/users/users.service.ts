import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto, UserResponseDto } from '../auth/dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.getUsers();
    return users.map((user) => this.formatUserResponse(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.formatUserResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Validar email único se está sendo alterado
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user({ email: updateUserDto.email });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const dataToUpdate: any = {};

    if (updateUserDto.name) {
      dataToUpdate.name = updateUserDto.name;
    }

    if (updateUserDto.email) {
      dataToUpdate.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.updateUser({ id }, dataToUpdate);

    return this.formatUserResponse(updatedUser);
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const deletedUser = await this.prisma.deleteUser({ id });

    return this.formatUserResponse(deletedUser);
  }

  private formatUserResponse(user: any): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
