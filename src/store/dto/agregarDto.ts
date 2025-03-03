import { IsDecimal, IsInt, IsNotEmpty, IsNumber } from "class-validator";


export class AgregarDto{
    @IsNotEmpty() nombre: string;
    @IsNotEmpty() descripcion: string;
    @IsInt() stock: number;
    @IsDecimal() precio: number;
    @IsDecimal() descuento: number;
    @IsNotEmpty() foto1: string;
    @IsNotEmpty() foto2: string;
    @IsNotEmpty() foto3: string;
    @IsNotEmpty() foto4: string;
    @IsNotEmpty() foto5: string;
    @IsNotEmpty() sexo: string;
    @IsNumber() categoria: number;
}