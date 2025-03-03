import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './categoria.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async getNombreId(id: number): Promise<string | null> {
    const nombre = await this.categoriaRepo.findOne({
      where: { idcategoria: id },
    });
    if (!nombre) {
      throw new NotFoundException('No hay Categoria');
    }
    return nombre?.nombre;
  }

  async todosCate(
    bus: string,
    page: number,
    limit: number,
  ): Promise<any | null> {
    const [categoria, total] = await this.categoriaRepo.findAndCount({
      where: {nombre: Like(`%${bus}%`)},
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: categoria,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async agregarcate(nombre: string): Promise<Categoria | null>{
    const datos = await this.categoriaRepo.create({
      nombre: nombre
    });
    return await this.categoriaRepo.save(datos);
  }

  async actualizarCate(id: number, nombre: string): Promise<Categoria| null>{
    const datos = await this.categoriaRepo.update(id,{
      nombre:nombre
    });

    return await this.categoriaRepo.findOne({ where: { idcategoria:id } });
  }

  async eliminarCate(id: number){
    await this.categoriaRepo.delete(id);
  }
}
