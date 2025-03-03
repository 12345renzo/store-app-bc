import { Usuario } from 'src/usuario/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:'rol'})
export class Rol {
  @PrimaryGeneratedColumn() idrol: number;
  @Column({ unique: true }) nombre: string;
  @OneToMany(() => Usuario, (user: Usuario) => user.rol)
  usuario: Usuario[];
}
