import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginUserDto, CreateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.createUser({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user({ email: loginUserDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
    };
  }
}
