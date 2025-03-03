import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async findById(id: number): Promise<Rol | null> {
    const nombre = await this.rolRepository.findOne({ where: { idrol: id } });
    return nombre;
  }

  async agregarRol(nombre: string): Promise<Rol|null>{
    const datos = await this.rolRepository.create({
      nombre:nombre,
    });

    return await this.rolRepository.save(datos);
  }

  async eliminar(id:number){
    await this.rolRepository.delete(id);
  }

  async findByIdName(id: number): Promise<any | null> {
    const nombre = await this.rolRepository.findOne({ where: { idrol: id } });
    return nombre?.nombre;
  }
}
