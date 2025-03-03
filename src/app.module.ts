import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { RolModule } from './rol/rol.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoModule } from './producto/producto.module';
import { CategoriaModule } from './categoria/categoria.module';
import { StoreModule } from './store/store.module';
import { PedidoModule } from './pedido/pedido.module';
import { DetallePedidoModule } from './detalle_pedido/detalle_pedido.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    /*TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'LAPTOP-8GVA8RH5\\MSSQLSERVER01', 
      port: 1433,
      username: 'renzo16',
      password: 'renzoGA16@',
      database: 'store_app_db',*/
    //entities: [__dirname + '/**/*.entity{.ts,.js}'],
    /*synchronize: true,
      options: {
        encrypt: false,
        enableArithAbort: true,
      },
      extra: {
        trustServerCertificate: true,
      },
      autoLoadEntities: true,
    }),*/
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: true, // Habilita SSL
      extra: {
        ssl: {
          rejectUnauthorized: false, // Permite certificados autofirmados (necesario para Render)
        },
      },
    }),
    ProductoModule,
    UsuarioModule,
    AuthModule,
    RolModule,
    CategoriaModule,
    StoreModule,
    PedidoModule,
    DetallePedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
