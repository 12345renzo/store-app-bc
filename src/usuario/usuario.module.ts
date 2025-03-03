import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModule } from 'src/rol/rol.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), RolModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
