import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'João Victor' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}

export class ValidateTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;
}
