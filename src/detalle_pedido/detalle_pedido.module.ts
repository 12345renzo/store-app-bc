import { Module } from '@nestjs/common';
import { DetallePedidoController } from './detalle_pedido.controller';
import { DetallePedidoService } from './detalle_pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detalle_pedido } from './detalle_pedido.entity';
import { PedidoModule } from 'src/pedido/pedido.module';
import { Pedido } from 'src/pedido/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Detalle_pedido,Pedido]), PedidoModule],
  controllers: [DetallePedidoController],
  providers: [DetallePedidoService],
  exports: [DetallePedidoService]
})
export class DetallePedidoModule {}
