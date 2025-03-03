import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './producto.entity';
import { CategoriaModule } from 'src/categoria/categoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Producto]),CategoriaModule],
  providers: [ProductoService],
  controllers: [ProductoController],
  exports: [ProductoService]
})
export class ProductoModule {}
