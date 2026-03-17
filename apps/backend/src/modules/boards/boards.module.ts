import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsModule } from '../columns/columns.module';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), forwardRef(() => ColumnsModule)],
  providers: [BoardsService, BoardsResolver],
  exports: [BoardsService],
})
export class BoardsModule {}
