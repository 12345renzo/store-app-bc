import { IsDate, IsDecimal, IsNotEmpty } from 'class-validator';

export class EditPedidoDto {
  @IsDate() fecha: string;
  @IsDecimal() subtotal: number;
  @IsDecimal() igv: number;
  @IsDecimal() total: number;
  @IsDecimal() descuento: number;
  @IsNotEmpty() estado: string;
  @IsNotEmpty() fechaEntrega: string;
  @IsNotEmpty() usuario: string;
}
