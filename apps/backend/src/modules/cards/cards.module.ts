import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewaysModule } from '../../gateways/gateways.module';
import { Column } from '../columns/entities/column.entity';
import { CardsResolver } from './cards.resolver';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Column]), GatewaysModule],
  providers: [CardsService, CardsResolver],
  exports: [CardsService],
})
export class CardsModule {}
