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
import puppeteer from 'puppeteer';
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

  async boletas(token: string, id: string): Promise<Buffer | null> {
    const dato = await this.validarToken(token);
    if (!dato.id || !dato.email || !dato.rol) {
      throw new Error('Error de token');
    }

    const pedido = await this.pedidoService.pedidoForId(id);
    if (!pedido) {
      throw new Error('No hay pedido');
    }

    const detalle = await this.detalleService.buscarDetalleForIdPedido(
      pedido.idpedido,
      1,
      250000,
    );

    const browser = await puppeteer.launch({
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        '/opt/render/.cache/puppeteer/chrome-headless-shell/linux-133.0.6943.141/chrome-headless-shell',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--headless=new',
      ],
      headless: true,
    });

    const deta = detalle
      ?.map((de) => {
        let monto = de.cantidad * de.precio;
        return ` <tr>
                      <td>${de.producto.nombre}</td>
                      <td>${de.cantidad}</td>
                      <td class="text-right">S/ ${monto}.00</td>
                  </tr>
              `;
      })
      .join('');

    try {
      const page = await browser.newPage();
      const htmlContent = `
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Boleta de Venta</title>
          <style>
              body {
                  font-family: 'Courier New', monospace;
                  max-width: 300px;
                  margin: 20px auto;
                  padding: 15px;
                  border: 3px solid aqua;
                  background-color: black;
                  color: white;
              }

              .header {
                  text-align: center;
                  border-bottom: 2px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
              }

              .company-name {
                  font-size: 20px;
                  font-weight: bold;
                  margin-bottom: 5px;
              }

              .details {
                  margin-bottom: 15px;
              }

              .items-table {
                  width: 100%;
                  margin: 15px 0;
                  border-collapse: collapse;
              }

              .items-table th {
                  border-bottom: 1px solid #000;
                  padding: 5px 0;
              }

              .items-table td {
                  padding: 5px 0;
                  border-bottom: 1px solid #eee;
              }

              .total {
                  text-align: right;
                  font-weight: bold;
                  margin-top: 15px;
              }

              .impo {
                  text-align: right;
                  margin-top: 15px;
              }

              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  text-align: center;
                  border-top: 2px dashed #000;
                  padding-top: 10px;
              }

              .text-right {
                  text-align: right;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-name">Vogue Space</div>
              <div>RUC: 12345678901</div>
              <div>Av. Universitaria 6257 - Lima</div>
              <div>Tel: 987 654 321</div>
          </div>

          <div class="details">
              <div style="display: flex; justify-content: space-between;">
                  <div>Fecha: <p>${pedido.fecha}</p></div>
                  <div>Boleta: <p>${pedido.idpedido}</p></div>
              </div>
              <div>Cliente: ${pedido.usuario.nombre} ${pedido.usuario.apellido}</div>
              <div>ID: ${pedido.usuario.idusuario}</div>
          </div>

          <table class="items-table">
              <thead>
                  <tr>
                      <th>Descripción</th>
                      <th>Cant.</th>
                      <th>Total</th>
                  </tr>
              </thead>
              <tbody>
                ${deta}
              </tbody>
          </table>

          <div class="impo">SUBTOTAL: S/ ${pedido.subtotal}.00</div>
          <div class="impo">DESC.: -S/ ${pedido.descuento}.00</div>
          <div class="impo">IGV: +S/ ${pedido.igv}.00</div>
          <div class="total">
              TOTAL: S/ ${pedido.total}.00
          </div>

          <div class="footer">
              ¡Gracias por su compra!<br>
              Conserve esta boleta
          </div>
      </body>
      </html>
    `;

      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        width: '80mm',
        printBackground: true,
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error al generar el PDF con Puppeteer:', error);
      await browser.close();
      return null;
    }
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

  async editPedidos(token: string, editpedi: EditPedidoDto, id:string){
    const dato = await this.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const iduser = await this.usuarioServices.findByEmail(editpedi.usuario);
  
    const nuevo = {...editpedi, usuario: iduser?.idusuario};

    const datos = await this.pedidoService.editPedidos(id,nuevo);

    return datos;
  }
}
