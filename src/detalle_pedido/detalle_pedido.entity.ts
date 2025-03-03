import { Pedido } from "src/pedido/pedido.entity";
import { Producto } from "src/producto/producto.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'detalle_pedido' })
export class Detalle_pedido {
  @PrimaryGeneratedColumn() iddetallepedido: number;
  @Column({ type: 'int' }) cantidad: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) precio: number;
  @Column({ length: 100}) talla: string;
  @ManyToOne(() => Pedido, (ped: Pedido) => ped.detalle_pedido, { eager: true })
  pedido: Pedido;
  @ManyToOne(() => Producto, (pro: Producto) => pro.detallepedido, {
    eager: true,
  })
  producto: Producto;
}