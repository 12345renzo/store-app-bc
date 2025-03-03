import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaService } from 'src/categoria/categoria.service';
import { AgregarDto } from 'src/store/dto/agregarDto';

@Injectable()
export class ProductoService {
    constructor(
        @InjectRepository(Producto)
        private readonly productRepositiry: Repository<Producto>,
        private categoriaServi: CategoriaService
    ){}

    //traer todos los producto paginado
    async traerTodo(page: number, limit: number): Promise<any | null>{
        const [producto, total] = await this.productRepositiry.findAndCount({
            skip: (page-1)*limit,
            take: limit
        });

        const completo = await Promise.all(
          producto.map(async (pro) => ({
            ...pro,
            categoria: await this.categoriaServi.getNombreId(
              pro.categoria.idcategoria,
            ),
          })),
        );

        return{
            data: completo,
            total,
            page,
            lastPage: Math.ceil(total/limit),
        }
    }

    //agregar producto
    async agregarProductos(agregarDTO: AgregarDto): Promise<Producto | null>{
        const datos = await this.productRepositiry.create({
            nombre: agregarDTO.nombre,
            descripcion: agregarDTO.descripcion,
            stock: agregarDTO.stock,
            precio: agregarDTO.precio,
            descuento: agregarDTO.descuento,
            foto1: agregarDTO.foto1,
            foto2:agregarDTO.foto2,
            foto3: agregarDTO.foto3,
            foto4: agregarDTO.foto4,
            foto5: agregarDTO.foto5,
            sexo: agregarDTO.sexo,
            categoria: { idcategoria: agregarDTO.categoria },
        });

        return await this.productRepositiry.save(datos);
    }

    //buscar produscto por id
    async buscarProducto(id: string): Promise<Producto | null>{
        const datos = await this.productRepositiry.findOne({ where: {idproducto: id}});
        return datos;
    }

    //editar producto
    async editarProducto(id: string, agregar: AgregarDto): Promise<Producto | null>{
        const datos = await this.productRepositiry.update(id,{
          nombre: agregar.nombre,
          descripcion: agregar.descripcion,
          stock: agregar.stock,
          precio: agregar.precio,
          descuento: agregar.descuento,
          foto1: agregar.foto1,
          foto2: agregar.foto2,
          foto3: agregar.foto3,
          foto4: agregar.foto4,
          foto5: agregar.foto5,
          sexo: agregar.sexo,
          categoria: { idcategoria: agregar.categoria },
        });

        return await this.productRepositiry.findOne({
          where: { idproducto: id },
          relations: ['categoria'],
        });
    }

    //eliminar producto
    async destroyProducto(id: string){
        await this.productRepositiry.delete(id);
    }

    //buscar por nombre
    async buscarProductoNombre(producto: string, page: number, limit: number): Promise<any | null>{
        const [dato, count] = await this.productRepositiry.findAndCount({
          where: { nombre: Like(`%${producto}%`) },
          skip: (page - 1) * limit,
          take: limit,
        });

        const completo = await Promise.all(
          dato.map(async (pro) => ({
            ...pro,
            categoria: await this.categoriaServi.getNombreId(
              pro.categoria.idcategoria,
            ),
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
