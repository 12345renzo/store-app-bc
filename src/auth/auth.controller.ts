import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { RegisDto } from './dto/regisDto';
import { EditDto } from './dto/editDto';
import { AgregarDto } from './dto/agregarDto';

@Controller('auth')
export class AuthController {
  constructor(private authServi: AuthService) {}

  @Post('login')
  async login(@Body() logindto: LoginDto) {
    return this.authServi.startLogin(logindto);
  }

  @Post('register')
  async register(@Body() regisdto: RegisDto) {
    return this.authServi.startRegister(regisdto);
  }

  @Post('resetPass')
  async cambiar(@Body() login: LoginDto) {
    return this.authServi.resetPass(login);
  }

  @Get('revalidar')
  async revalidar(@Headers('x-token') token: string) {
    return this.authServi.revalidarToken(token);
  }

  @Post('editar')
  async editarPerfil(
    @Headers('x-token') token: string,
    @Body() datos: EditDto,
  ) {
    return this.authServi.editUsuario(datos, token);
  }

  @Post('user/add')
  async agregarPerfil(
    @Headers('x-token') token: string,
    @Body() dato: AgregarDto,
  ) {
    return await this.authServi.addUsuario(token, dato);
  }

  @Delete('user/eliminar/:id')
  async eliminarPerfil(
    @Headers('x-token') token: string,
    @Param('id') id: string,
  ) {
    return await this.authServi.deleteUsuario(token, id);
  }

  @Get('user')
  async listarPerfil(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('q') usuario: string,
    @Headers('x-token') token: string,
  ) {
    const newpage = parseInt(page, 10) || 1;
    const newlimit = parseInt(limit, 10) || 10;

    return await this.authServi.listaUsuario(newpage,newlimit,usuario,token);
  }
}
