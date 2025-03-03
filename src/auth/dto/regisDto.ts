import { IsEmail, IsNotEmpty} from 'class-validator';

export class RegisDto {
  @IsNotEmpty() nombre: string;
  @IsNotEmpty() apellido: string;
  @IsNotEmpty() telefono: string;
  @IsNotEmpty() password: string;
  @IsNotEmpty() rol: number;
  @IsEmail({}, { message: 'Email Inválido' }) email: string;
}
