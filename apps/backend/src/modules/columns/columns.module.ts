import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewaysModule } from '../../gateways/gateways.module';
import { CardsModule } from '../cards/cards.module';
import { ColumnsResolver } from './columns.resolver';
import { ColumnsService } from './columns.service';
import { Column } from './entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column]), forwardRef(() => CardsModule), GatewaysModule],
  providers: [ColumnsService, ColumnsResolver],
  exports: [ColumnsService],
})
export class ColumnsModule {}
