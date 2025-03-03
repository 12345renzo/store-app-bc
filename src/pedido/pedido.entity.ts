import { Detalle_pedido } from 'src/detalle_pedido/detalle_pedido.entity';
import { Usuario } from 'src/usuario/usuario.entity';
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({ name: 'pedido' })
export class Pedido {
  @PrimaryColumn() idpedido: string;
  @Column({ type: 'date' }) fecha: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) subtotal: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) descuento: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) igv: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) total: number;
  @Column({ type: 'date' }) fechaEntrega: string;
  @Column({length: 100}) estado: string;
  @OneToMany(() => Detalle_pedido, (dep: Detalle_pedido) => dep.pedido)
  detalle_pedido: Detalle_pedido[];
  @ManyToOne(() => Usuario, (pro: Usuario) => pro.pedido, { eager: true })
  usuario: Usuario;
  @BeforeInsert()
  generateId() {
    this.idpedido = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
