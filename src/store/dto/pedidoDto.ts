import { IsArray, IsDate, IsDecimal, IsInt, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class adicional {
  @IsNotEmpty() idproducto: string;
  @IsInt() cantidad: number;
  @IsDecimal() precio: number;
  @IsNotEmpty() talla: string;
}

export class PedidosDto {
  @IsDate() fecha: string;
  @IsDecimal() subtotal: number;
  @IsDecimal() igv: number;
  @IsDecimal() total: number;
  @IsDecimal() descuento: number;
  @IsNotEmpty() estado: string;
  @IsNotEmpty() fechaEntrega: string;
  //@IsNotEmpty() idpedido: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => adicional)
  productos: adicional[];
}