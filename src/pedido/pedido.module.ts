import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido]), UsuarioModule],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService]
})
export class PedidoModule {}
