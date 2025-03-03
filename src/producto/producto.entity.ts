import { Categoria } from "src/categoria/categoria.entity";
import { Detalle_pedido } from "src/detalle_pedido/detalle_pedido.entity";
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity({ name: 'producto' })
export class Producto {
  @PrimaryColumn() idproducto: string;
  @Column({ length: 150 }) nombre: string;
  @Column({ length: 500 }) descripcion: string;
  @Column({ type: 'int' }) stock: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) precio: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) descuento: number;
  @Column({ length: 750 }) foto1: string;
  @Column({ length: 750 }) foto2: string;
  @Column({ length: 750 }) foto3: string;
  @Column({ length: 750 }) foto4: string;
  @Column({ length: 750 }) foto5: string;
  @Column({ length: 100 }) sexo: string;
  @OneToMany(() => Detalle_pedido, (pe: Detalle_pedido) => pe.producto)
  detallepedido: Detalle_pedido[];
  @ManyToOne(() => Categoria, (cat: Categoria) => cat.producto, { eager: true })
  categoria: Categoria;
  @BeforeInsert()
  generateId() {
    this.idproducto = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}