export class CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
