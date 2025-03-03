import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwtConstants';
import { RolModule } from 'src/rol/rol.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [
    StoreModule,
    UsuarioModule,
    RolModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
