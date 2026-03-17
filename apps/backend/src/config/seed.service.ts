import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../modules/boards/entities/board.entity';
import { Card } from '../modules/cards/entities/card.entity';
import { Column } from '../modules/columns/entities/column.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>
  ) {}

  async onModuleInit(): Promise<void> {
    const boardCount = await this.boardRepository.count();
    if (boardCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Empty database detected. Running seed...');
    await this.seed();
    this.logger.log('Seed completed successfully.');
  }

  private async seed(): Promise<void> {
    const board = await this.boardRepository.save(
      this.boardRepository.create({ title: 'Kanban Board' })
    );

    const columns = await this.columnRepository.save([
      this.columnRepository.create({ title: 'To Do', order: 0, boardId: board.id }),
      this.columnRepository.create({ title: 'In Progress', order: 1, boardId: board.id }),
      this.columnRepository.create({ title: 'Review', order: 2, boardId: board.id }),
      this.columnRepository.create({ title: 'Done', order: 3, boardId: board.id }),
    ]);

    const todo = columns[0];
    const inProgress = columns[1];

    await this.cardRepository.save([
      this.cardRepository.create({
        title: 'Setup project structure',
        description: 'Initialize the monorepo with frontend and backend apps',
        order: 0,
        columnId: todo.id,
        owner: 'Dev Team',
      }),
      this.cardRepository.create({
        title: 'Configure database',
        description: 'Setup PostgreSQL connection and TypeORM entities',
        order: 1,
        columnId: todo.id,
        owner: 'Backend Team',
      }),
      this.cardRepository.create({
        title: 'Design UI components',
        description: 'Create kanban board layout with drag and drop support',
        order: 0,
        columnId: inProgress.id,
        owner: 'Frontend Team',
      }),
    ]);
  }
}
