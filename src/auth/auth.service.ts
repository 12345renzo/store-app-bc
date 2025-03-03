import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RolService } from 'src/rol/rol.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/loginDto';
import { RegisDto } from './dto/regisDto';
import { StoreService } from 'src/store/store.service';
import { EditDto } from './dto/editDto';
import { Usuario } from 'src/usuario/usuario.entity';
import { AgregarDto } from './dto/agregarDto';

@Injectable()
export class AuthService {
  //agregamos los entity
  constructor(
    private userService: UsuarioService,
    private storeService: StoreService,
    private rolService: RolService,
    private jwtService: JwtService,
  ) {}

  //validamos el usuario existencia de usuario
  async validarUsuario(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  //logeo
  async startLogin(loginDTO: LoginDto) {
    const user = await this.validarUsuario(loginDTO.email, loginDTO.password);
    if (!user) {
      return {
        message: 'Usuario o contraseña incorrectos',
      };
    }

    const cate = await this.rolService.findById(user.rol.idrol);

    if (user) {
      const payload = {
        id: user.idusuario,
        email: user.email,
        rol:cate?.nombre
      };
      return {
        id: user.idusuario,
        usuario: {
          ...user,
          rol:cate?.nombre 
        },
        rol:cate?.nombre,
        token: this.jwtService.sign(payload),
      };
    }
  }

  //register
  async startRegister(regisdto: RegisDto) {
    const user = await this.userService.findByEmail(regisdto.email);
    if (user) {
      return {
        message: 'El email ya esta en uso',
      };
    }

    const categoria = await this.rolService.findById(regisdto.rol);
    const data = await this.userService.createUsuario(regisdto);

    if (data) {
      const payload = {
        id: data.idusuario,
        email: data.email,
        rol: categoria?.nombre,
      };

      return {
        id: data.idusuario,
        usuario: data,
        rol: categoria?.nombre,
        token: this.jwtService.sign(payload),
      };
    }
  }

  //editar usuario
  async editUsuario(regis: EditDto, token: string) {
    const dato = await this.storeService.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const datos = await this.userService.perfilUsuario(regis);

    if (!datos) {
      return { message: 'Error de Editar Perfil' };
    }

    return {
      message: 'Actualizado Correctamente',
    };
  }

  //reset pass
  async resetPass(login: LoginDto) {
    const user = await this.userService.findByEmail(login.email);

    if (!user) {
      return { message: 'No ay ese Usuario' };
    }

    const data = await this.userService.editarUsuario(login, user.idusuario);

    const categoria = await this.rolService.findById(user.rol.idrol);

    if (!data) {
      return { message: 'Error de cambio de clave' };
    }

    const payload = {
      id: user.idusuario,
      email: user.email,
      rol:categoria?.nombre,
    };

    return {
      id: user.idusuario,
      usuario: user,
      rol: categoria?.nombre,
      token: this.jwtService.sign(payload),
    };
  }

  //revalidar token
  async revalidarToken(token: string) {
    const dato = await this.storeService.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const todo = await this.userService.findById(dato.id);

    if (!todo) {
      return { message: 'No ay User con ese ID' };
    }

    const cate = await this.rolService.findById(todo.rol.idrol);

    const payload = {
      id: todo?.idusuario,
      email: todo?.email,
      rol:cate?.nombre,
    };

    return {
      id: todo.idusuario,
      usuario:todo,
      rol: cate?.nombre,
      token: this.jwtService.sign(payload),
    };
  }

  //agregar usuario
  async addUsuario(token: string, agregar: AgregarDto) {
    const dato = await this.storeService.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const user = await this.userService.findByEmail(agregar.email);
    if (user) {
      return {
        message: 'El email ya esta en uso',
      };
    }

    const data = await this.userService.addUsuario(agregar);

    return data;
  }

  async deleteUsuario(token: string, id: string) {
    const dato = await this.storeService.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }

    const datos = await this.storeService.eliminarHistoryUser(id);

    await this.userService.eliminarUsuario(id);

    return {
      message: 'eliminado',
    };
  }

  async listaUsuario(page: number, limit: number, bus: string, token: string) {
    const dato = await this.storeService.validarToken(token);
    if (dato.id == null && dato.email == null && dato.rol == null) {
      return {
        message: 'error de token',
      };
    }
    const completo = await this.userService.buscarUsuario(bus, page, limit);

    return completo;
  }
}
