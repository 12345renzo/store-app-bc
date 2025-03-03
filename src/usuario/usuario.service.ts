import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisDto } from 'src/auth/dto/regisDto';
import { LoginDto } from 'src/auth/dto/loginDto';
import { EditDto } from 'src/auth/dto/editDto';
import { AgregarDto } from 'src/auth/dto/agregarDto';
import { RolService } from 'src/rol/rol.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioReport: Repository<Usuario>,
    private rolservice: RolService,
  ) {}

  async agregarRol(nombre: string){
    const rpta = await this.rolservice.agregarRol(nombre);
    return rpta;
  }

  async eliminarRol(id:number) {
    await this.rolservice.eliminar(id);
    return{
      message:'eliminado',
    }
  }

  async getEmailForId(id: string): Promise<string | null> {
    const nombre = await this.usuarioReport.findOne({
      where: { idusuario: id },
    });
    if (!nombre) {
      throw new NotFoundException('No hay Categoria');
    }
    return nombre?.email;
  }

  async findById(id: string): Promise<Usuario | null> {
    const datos = await this.usuarioReport.findOne({
      where: { idusuario: id },
    });
    if (!datos) {
      return null;
    }
    return datos;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const datos = await this.usuarioReport.findOne({ where: { email } });
    if (!datos) {
      return null;
    }
    return datos;
  }

  async createUsuario(data: RegisDto): Promise<Usuario | null> {
    const cifrado = await bcrypt.hash(data.password, 10);
    const usuario = this.usuarioReport.create({
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      email: data.email,
      password: cifrado,
      edad: 0,
      sexo: '',
      direccion: '',
      rol: { idrol: data.rol },
    });

    return await this.usuarioReport.save(usuario);
  }

  async perfilUsuario(data: EditDto): Promise<Usuario | null> {
    const usuario = this.usuarioReport.update(data.id, {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      edad: data.edad,
      sexo: data.sexo,
      direccion: data.direccion,
    });

    return await this.usuarioReport.findOne({
      where: { idusuario: data.id },
    });
  }

  async editarUsuario(dato: LoginDto, id: string): Promise<any | null> {
    const cifrado = await bcrypt.hash(dato.password, 10);

    const final = await this.usuarioReport.update(id, {
      email: dato.email,
      password: cifrado,
    });

    return final;
  }

  async addUsuario(data: AgregarDto): Promise<Usuario | null> {
    const cifrado = await bcrypt.hash(data.password, 10);
    const usuario = this.usuarioReport.create({
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      email: data.email,
      password: cifrado,
      edad: data.edad,
      sexo: data.sexo,
      direccion: data.direccion,
      rol: { idrol: data.rol },
    });

    return await this.usuarioReport.save(usuario);
  }

  async eliminarUsuario(id: string) {
    await this.usuarioReport.delete(id);
  }

  async buscarUsuario(usuario: string, page: number, limit: number) {
    const [dato, count] = await this.usuarioReport.findAndCount({
      where: [
        { nombre: Like(`%${usuario}%`) },
        { email: Like(`%${usuario}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    const completo = await Promise.all(
      dato.map(async (pro) => ({
        ...pro,
        rol: await this.rolservice.findByIdName(pro.rol.idrol),
      })),
    );

    return {
      data: completo,
      count,
      page,
      lastPage: Math.ceil(count / limit),
    };
  }
}
