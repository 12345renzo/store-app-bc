import { IsEmail, IsNotEmpty } from 'class-validator';

export class AgregarDto {
  @IsNotEmpty() nombre: string;
  @IsNotEmpty() apellido: string;
  @IsNotEmpty() telefono: string;
  @IsNotEmpty() edad: number;
  @IsNotEmpty() sexo: string;
  @IsNotEmpty() direccion: string;
  @IsNotEmpty() password: string;
  @IsNotEmpty() rol: number;
  @IsEmail({}, { message: 'Email Inválido' }) email: string;
}
