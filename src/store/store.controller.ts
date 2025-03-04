import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Res } from '@nestjs/common';
import { StoreService } from './store.service';
import {Response} from 'express'
import { AgregarDto } from './dto/agregarDto';
import { PedidosDto } from './dto/pedidoDto';
import { EditPedidoDto } from './dto/editPedidoDto';

@Controller('store')
export class StoreController {
  constructor(private storeServi: StoreService) {}

  //listar todo los producto paginados
  @Get('/')
  async traerProductos(
    @Query('page') page: string,
    @Query('limit') limit: string,
    //@Headers('x-token') token: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;

    return this.storeServi.getProduct(newpage, newlimit);
  }

  //agregar producto
  @Post('/addProduct')
  async addProducto(
    @Body() agregarDTO: AgregarDto,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.almacenarProducto(agregarDTO, token);
  }

  //actualizar producto
  @Put('/updateProdut/:id')
  async updateProducto(
    @Body() agregar: AgregarDto,
    @Param('id') id: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.actualizarProducto(agregar, id, token);
  }

  //eliminar producto
  @Delete('/deleteProdut/:id')
  async deleteProducto(
    @Param('id') id: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.eliminarProducto(id, token);
  }

  //buscar producto paginado por nombre
  @Get('/search')
  async searchProducto(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('q') producto: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;
    return await this.storeServi.buscar(producto, newpage, newlimit);
  }

  //pa agregar pedido mandar id del usuario
  @Post('/addPedido/:id')
  async masPedido(
    @Param('id') id: string,
    @Headers('x-token') token: string,
    @Body() pedido: PedidosDto,
  ) {
    return await this.storeServi.agregarPedido(id, token, pedido);
  }

  //para listar todos los pedidos por usuario paginado
  @Get('/pedidos/:id')
  async pedidoForUser(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Param('id') id: string,
    @Headers('x-token') token: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;
    return await this.storeServi.listarPedidoForUser(
      id,
      token,
      newpage,
      newlimit,
    );
  }

  //eliminar pedido pasando el id pedido en detalle y pedido
  @Delete('/pedidos/:id')
  async eliminarpedido(
    @Param('id') id: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.deletePedido(id, token);
  }

  //buscar pedidos por fecha
  @Get('/pedidos')
  async busPedidos(
    @Query('q') fecha: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Headers('x-token') token: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;
    return await this.storeServi.searchPedido(fecha, newpage, newlimit, token);
  }

  @Post('/genPdf/:id')
  async generarPdf(
    @Headers('x-token') token: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.storeServi.boletas(token, id);

      if (!pdfBuffer) {
        return res.status(400).json({ message: 'Error al generar el PDF' });
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="boleta.pdf"',
      });

      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  //listar categorias paginados
  @Get('/cate/lista')
  async traerCategorias(
    @Query('q') busca: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Headers('x-token') token: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;
    return await this.storeServi.todosCate(busca, newpage, newlimit, token);
  }

  @Post('/cate/add')
  async agregarCategoria(
    @Body('nombre') nombre: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.addCategoria(nombre, token);
  }

  @Put('/cate/update/:id')
  async editarCategoria(
    @Param('id') id: string,
    @Body('nombre') nombre: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.updateCategoria(id, nombre, token);
  }

  @Delete('/cate/delete/:id')
  async eliminarCategoria(
    @Param('id') id: string,
    @Headers('x-token') token: string,
  ) {
    return await this.storeServi.deleteCategoria(id, token);
  }

  @Put('/pedidos/:id')
  async editarPedi(
    @Param('id') id: string,
    @Headers('x-token') token: string,
    @Body() edit: EditPedidoDto,
  ) {
    return await this.storeServi.editPedidos(token, edit, id);
  }
}
