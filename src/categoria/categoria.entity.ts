import { Producto } from "src/producto/producto.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'categoria' })
export class Categoria {
  @PrimaryGeneratedColumn() idcategoria: number;
  @Column({ unique: true, length: 100 }) nombre: string;
  @OneToMany(() => Producto, (pro: Producto) => pro.categoria)
  producto: Producto[];
}