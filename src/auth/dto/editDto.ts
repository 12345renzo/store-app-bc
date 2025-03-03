import { IsEmail, IsNotEmpty} from 'class-validator';

export class EditDto {
  @IsNotEmpty() id: string;
  @IsNotEmpty() nombre: string;
  @IsNotEmpty() apellido: string;
  @IsNotEmpty() telefono: string;
  @IsNotEmpty() edad: number;
  @IsNotEmpty() sexo: string;
  @IsNotEmpty() direccion: string;
}