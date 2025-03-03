import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private userService: UsuarioService) {}
  @Post('/addrol')
  async addProducto(@Body('nombre') nombre: string) {
    return await this.userService.agregarRol(nombre);
  }

  @Delete('/rol/:id')
  async deleteProducto(
    @Param('id') id: number,
  ) {
    return await this.userService.eliminarRol(id);
  }
}
