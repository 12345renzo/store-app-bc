import { Pedido } from 'src/pedido/pedido.entity';
import { Rol } from 'src/rol/rol.entity';
import { 
  BeforeInsert, 
  Column, 
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryColumn,
} from 'typeorm';
@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryColumn() idusuario: string;
  @Column({ length: 250 }) nombre: string;
  @Column({ length: 250 }) apellido: string;
  @Column({ length: 350 }) telefono: string;
  @Column({ unique: true, length: 350 }) email: string;
  @Column() password: string;
  @Column({ type: 'int' }) edad: number;
  @Column({ length: 100 }) sexo: string;
  @Column({ length: 250 }) direccion: string;
  @ManyToOne(() => Rol, (rol: Rol) => rol.usuario, { eager: true })
  rol: Rol;
  @OneToMany(() => Pedido, (pe: Pedido) => pe.usuario)
  pedido: Pedido[];
  @BeforeInsert()
  generateId() {
    this.idusuario = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
