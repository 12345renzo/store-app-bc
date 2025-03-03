import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { Between, Like, Repository } from 'typeorm';
import { UsuarioService } from 'src/usuario/usuario.service';
import { EditPedidoDto } from 'src/store/dto/editPedidoDto';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoreport: Repository<Pedido>,
    private usuarioService: UsuarioService,
  ) {}

  async addPedido(
    fecha: string,
    subtotal: number,
    igv: number,
    total: number,
    descuento: number,
    fechaEntrega: string,
    estado: string,
    id: string,
  ): Promise<Pedido | null> {
    const dato = await this.pedidoreport.create({
      fecha,
      subtotal,
      igv,
      total,
      descuento,
      fechaEntrega,
      estado,
      usuario: { idusuario: id },
    });

    return await this.pedidoreport.save(dato);
  }

  async traerPedidosForUser(id: string): Promise<Pedido[] | null> {
    const todos = await this.pedidoreport.find({
      where: { usuario: { idusuario: id } },
    });

    return todos;
  }

  async pedidoForId(id: string): Promise<Pedido | null> {
    const dato = await this.pedidoreport.findOne({ where: { idpedido: id } });
    return dato;
  }

  async eliminarPedidoOfId(id: string) {
    await this.pedidoreport.delete(id);
  }

  async listarPedidosAll(fecha: string, page: number, limit: number) {
    try {
      let whereCondition = {};

      // Check if a date was provided
      if (fecha && fecha.trim() !== '') {
        // Parse the date
        const searchDate = new Date(fecha);

        // Create a range for the entire day
        const startDate = new Date(searchDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(searchDate);
        endDate.setHours(23, 59, 59, 999);

        whereCondition = {
          fecha: Between(startDate, endDate),
        };
      }

      // Now use the where condition in your query
      const [datos, count] = await this.pedidoreport.findAndCount({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
      });

      // Process the results
      const completo = await Promise.all(
        datos.map(async (pro) => ({
          ...pro,
          usuario: await this.usuarioService.getEmailForId(
            pro.usuario.idusuario,
          ),
        })),
      );

      return {
        data: completo,
        count,
        page,
        lastPage: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error('Error searching orders:', error);
      return {
        data: [],
        count: 0,
        page,
        lastPage: 0,
      };
    }
  }

  async editPedidos(id: string, edit: any): Promise<Pedido | null> {
    const datos = await this.pedidoreport.update(id, {
      fecha: edit.fecha,
      subtotal: edit.subtotal,
      igv: edit.igv,
      total: edit.total,
      descuento: edit.descuento,
      estado: edit.estado,
      fechaEntrega: edit.fechaEntrega,
      usuario: { idusuario: edit.usuario },
    });

    return await this.pedidoreport.findOne({
      where: { idpedido: id },
    });
  }
}
