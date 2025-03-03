import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { ProductoModule } from 'src/producto/producto.module';
import { CategoriaModule } from 'src/categoria/categoria.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/jwtConstants';
import { PedidoModule } from 'src/pedido/pedido.module';
import { DetallePedidoModule } from 'src/detalle_pedido/detalle_pedido.module';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [
    UsuarioModule,
    ProductoModule,
    CategoriaModule,
    PedidoModule,
    DetallePedidoModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule {}
