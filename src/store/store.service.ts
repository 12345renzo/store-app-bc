import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/jwtConstants';
import { CategoriaService } from 'src/categoria/categoria.service';
import { Producto } from 'src/producto/producto.entity';
import { ProductoService } from 'src/producto/producto.service';
import { AgregarDto } from './dto/agregarDto';
import { PedidosDto } from './dto/pedidoDto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { DetallePedidoService } from 'src/detalle_pedido/detalle_pedido.service';
import * as PDFDocument from 'pdfkit';
import { EditPedidoDto } from './dto/editPedidoDto';

@Injectable()
export class StoreService {
  constructor(
    private productServices: ProductoService,
    private categoriaServices: CategoriaService,
    private usuarioServices: UsuarioService,
    private pedidoService: PedidoService,
    private detalleService: DetallePedidoService,
    private jwtService: JwtService,
  ) {}

  //verificador de token
  async validarToken(token: string): Promise<any> {
    const datos = await this.jwtService.verify(token, {
      secret: jwtConstants.secret,
    });
    if (datos) {
      return datos;
    } else {
      return {
        message: 'No ay token o ya expiro',
      };
    }
  }

  //traer todos los producto paginados
  async getProduct(page: number, limit: number) {
    const content = await this.productServices.traerTodo(page, limit);
    if (!content) {
      return {
        message: 'No hay Producto',
      };
    }
    return content;
  }

  //agregar productos
  async almacenarProducto(agregarDTO: AgregarDto, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const completo = await this.productServices.agregarProductos(agregarDTO);

    if (!completo) {
      return {
        message: 'Error al ingresar Producto',
      };
    }

    const cate = await this.categoriaServices.getNombreId(
      completo.categoria.idcategoria,
    );

    return {
      id: completo.idproducto,
      nombre: completo.nombre,
      foto1: completo.foto1,
      categoria: cate,
      message: 'Producto Agregado',
    };
  }

  //editar productos
  async actualizarProducto(agregarDTO: AgregarDto, id: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const produc = await this.productServices.buscarProducto(id);

    if (!produc) {
      return {
        message: 'No ay Producto',
      };
    }

    const infoactu = await this.productServices.editarProducto(id, agregarDTO);

    if (!infoactu) {
      return {
        message: 'No se pudo actualizar',
      };
    }

    const cate = await this.categoriaServices.getNombreId(
      infoactu.categoria.idcategoria,
    );

    return {
      id: infoactu.idproducto,
      nombre: infoactu.nombre,
      foto1: infoactu.foto1,
      categoria: cate,
      message: 'Producto Actualizado',
    };
  }

  //eliminar productos
  async eliminarProducto(id: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const produc = await this.productServices.buscarProducto(id);
    if (!produc) {
      return {
        message: 'No ay Producto',
      };
    }

    await this.productServices.destroyProducto(id);

    return {
      messge: 'Producto Eliminado',
    };
  }

  //busqueda de productos por nombre
  async buscar(producto: string, page: number, limit: number) {
    const datos = await this.productServices.buscarProductoNombre(
      producto,
      page,
      limit,
    );
    if (datos?.length == 0) {
      return { message: 'No ay conincidencia con ningun Producto' };
    }

    return datos;
  }

  //agregar Pedido
  async agregarPedido(id: string, token: string, pedido: PedidosDto) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const usuario = await this.usuarioServices.findById(id);

    if (!usuario) {
      return { message: 'No existe usuario' };
    }

    const pedi = await this.pedidoService.addPedido(
      pedido.fecha,
      pedido.subtotal,
      pedido.igv,
      pedido.total,
      pedido.descuento,
      pedido.fechaEntrega,
      pedido.estado,
      id,
    );

    if (!pedi) {
      return { message: 'No se pudo agregar el Pedido' };
    }

    const deta = await this.detalleService.agregarDetalle(
      pedido.productos,
      pedi.idpedido,
    );

    return deta;
  }

  //listar los pedidos paginados
  async listarPedidoForUser(
    id: string,
    token: string,
    page: number,
    limit: number,
  ) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const usuario = await this.usuarioServices.findById(id);

    if (!usuario) {
      return { message: 'No existe usuario' };
    }

    const pedidos = await this.pedidoService.traerPedidosForUser(id);

    if (!pedidos) {
      return { message: 'No ay pedido con ese ID' };
    }

    let long = 0;
    const todos = await Promise.all(
      pedidos.map(async (pe) => {
        return {
          idpedido: pe.idpedido,
          detalles: await this.detalleService.buscarDetalleForIdPedido(
            pe.idpedido,
            page,
            limit,
          ),
        };
      }),
    );

    return {
      data: todos,
      lastPage: Math.ceil(long / limit),
    };
  }

  //eliminar pedidos
  async deletePedido(id: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const pedido = await this.pedidoService.pedidoForId(id);

    if (!pedido) {
      return { message: 'No ay ese Pedido' };
    }

    await this.detalleService.eliminarDetalle(pedido.idpedido);

    await this.pedidoService.eliminarPedidoOfId(pedido.idpedido);

    return {
      message: 'Pedido y Detalle Eliminado',
    };
  }

  //buscar pedidos por fecha
  async searchPedido(
    fecha: string,
    page: number,
    limit: number,
    token: string,
  ) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const datos = await this.pedidoService.listarPedidosAll(fecha, page, limit);
    return datos;
  }

  async generarBoletaPdf(token: string, id: string): Promise<Buffer> {
    // Validar token
    const dato = await this.validarToken(token);
    if (!dato.id || !dato.email || !dato.rol) {
      throw new Error('Error de autenticación');
    }

    // Obtener pedido
    const pedido = await this.pedidoService.pedidoForId(id);
    if (!pedido) {
      throw new Error('No hay pedido');
    }

    // Obtener detalles del pedido
    const detalle = await this.detalleService.buscarDetalleForIdPedido(
      pedido.idpedido,
      1,
      250000,
    );

    // Crear documento PDF
    const doc = new PDFDocument({
      size: [350, 600], // Tamaño de ticket térmico
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    });

    // Buffer para almacenar el PDF
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Estilo de fuente
    doc.font('Courier').fontSize(10).fillColor('black');

    // Encabezado
    doc.text('Vogue Space', { align: 'center', underline: true });
    doc.text('RUC: 12345678901', { align: 'center' });
    doc.text('Av. Universitaria 6257 - Lima', { align: 'center' });
    doc.text('Tel: 987 654 321', { align: 'center' });
    doc.moveDown();

    // Información del pedido
    doc.text(`Fecha: ${pedido.fecha}`, { continued: true });
    doc.text(`Boleta: ${pedido.idpedido}`, { align: 'right' });
    doc.text(`Cliente: ${pedido.usuario.nombre} ${pedido.usuario.apellido}`);
    doc.text(`ID: ${pedido.usuario.idusuario}`);
    doc.moveDown();

    // Encabezado de tabla
    doc
      .font('Courier-Bold')
      .text('Descripción', { continued: true })
      .text('Cant.', { continued: true, align: 'right' })
      .text('Total', { align: 'right' });
    doc.font('Courier');
    doc.moveDown();

    // Detalles de productos
    detalle?.forEach((de) => {
      const monto = de.cantidad * de.precio;
      doc
        .text(de.producto.nombre, { continued: true })
        .text(`${de.cantidad}`, { continued: true, align: 'right' })
        .text(`S/ ${monto}.00`, { align: 'right' });
    });

    doc.moveDown();

    // Totales
    doc
      .text('SUBTOTAL:', { continued: true })
      .text(`S/ ${pedido.subtotal}.00`, { align: 'right' });
    doc
      .text('DESC.:', { continued: true })
      .text(`-S/ ${pedido.descuento}.00`, { align: 'right' });
    doc
      .text('IGV:', { continued: true })
      .text(`+S/ ${pedido.igv}.00`, { align: 'right' });

    doc
      .font('Courier-Bold')
      .text('TOTAL:', { continued: true })
      .text(`S/ ${pedido.total}.00`, { align: 'right' });

    // Pie de página
    doc
      .font('Courier')
      .moveDown(2)
      .text('¡Gracias por su compra!', { align: 'center' })
      .text('Conserve esta boleta', { align: 'center' });

    // Finalizar documento
    doc.end();

    // Convertir a Buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  }

  async todosCate(busca: string, page: number, limit: number, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const datos = await this.categoriaServices.todosCate(busca, page, limit);

    return datos;
  }

  async addCategoria(nombre: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const rpta = await this.categoriaServices.agregarcate(nombre);

    return rpta;
  }

  async updateCategoria(id: string, nombre: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }
    const ids = parseInt(id);
    const rpta = await this.categoriaServices.actualizarCate(ids, nombre);

    return rpta;
  }

  async deleteCategoria(id: string, token: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }
    const ids = parseInt(id);
    await this.categoriaServices.eliminarCate(ids);
    return {
      message: 'Eliminado',
    };
  }

  async eliminarHistoryUser(id: string) {
    const datos = await this.pedidoService.traerPedidosForUser(id);
    if (datos == null) {
      return {
        estado: false,
      };
    }
    await Promise.all(
      datos.map(async (pro) => {
        await this.detalleService.eliminarDetalle(pro.idpedido);

        await this.pedidoService.eliminarPedidoOfId(pro.idpedido);
      }),
    );

    return {
      estado: true,
    };
  }

  async editPedidos(token: string, editpedi: EditPedidoDto, id: string) {
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const iduser = await this.usuarioServices.findByEmail(editpedi.usuario);

    const nuevo = { ...editpedi, usuario: iduser?.idusuario };

    const datos = await this.pedidoService.editPedidos(id, nuevo);

    return datos;
  }
}
