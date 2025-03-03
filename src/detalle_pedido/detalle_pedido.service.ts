import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Detalle_pedido } from './detalle_pedido.entity';
import { Like, Repository } from 'typeorm';
import { adicional } from 'src/store/dto/pedidoDto';
import { Pedido } from 'src/pedido/pedido.entity';

@Injectable()
export class DetallePedidoService {
  constructor(
    @InjectRepository(Detalle_pedido)
    private readonly detalleReport: Repository<Detalle_pedido>,

    @InjectRepository(Pedido)
    private readonly pedidoReport: Repository<Pedido>,
  ) {}

  //agregar el detalle
  async agregarDetalle(
    productos: adicional[],
    id: string,
  ): Promise<any | null> {
    const pedido = await this.pedidoReport.findOne({ where: { idpedido: id } });
    if (!pedido) {
      return { message: 'No ay ese Pedido' };
    }

    const detalles = await Promise.all(
      productos.map(async (pro) => {
        const nuevoDetalle = this.detalleReport.create({
          cantidad: pro.cantidad,
          precio: pro.precio,
          talla: pro.talla,
          pedido: { idpedido: pedido.idpedido },
          producto: { idproducto: pro.idproducto },
        });

        await this.detalleReport.save(nuevoDetalle);
      }),
    );

    return {
      message: 'Agregado el Pedido y Detalle',
    };
  }

  //este es para listar a todos los pedidos por usuario paginado
  async buscarDetalleForIdPedido(
    id: string,
    page: number,
    limit: number,
  ): Promise<Detalle_pedido[] | null> {
    const [detalles, count] = await this.detalleReport.findAndCount({
      where: { pedido: { idpedido: id } },
      skip: (page - 1) * limit,
      take: limit,
    });
    return detalles;
  }

  //eliminar el pedido detalle
  async eliminarDetalle(id: string) {
    await this.detalleReport.delete({ pedido: { idpedido: id } });
  }

  //buscar por fecha paginado
  async buscarForDate(
    fecha: string,
    page: number,
    limit: number,
  ): Promise<Detalle_pedido[] | null> {
    const [datos, count] = await this.detalleReport.findAndCount({
      where: { pedido: { fecha: Like(`%${fecha}%`) } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return datos;
  }
}
