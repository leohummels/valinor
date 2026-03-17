import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanGateway } from '../../gateways/kanban.gateway';
import { CreateColumnInput, UpdateColumnInput } from './dto';
import { Column } from './entities/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
    private readonly kanbanGateway: KanbanGateway
  ) {}

  async findAll(boardId?: string): Promise<Column[]> {
    const where = boardId ? { boardId } : {};
    return this.columnRepository.find({
      where,
      relations: ['cards'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ['cards'],
    });

    if (!column) {
      throw new NotFoundException(`Column with ID "${id}" not found`);
    }

    return column;
  }

  async create(input: CreateColumnInput): Promise<Column> {
    if (input.order === undefined) {
      const count = await this.columnRepository.count({
        where: { boardId: input.boardId },
      });
      input.order = count;
    }

    const column = this.columnRepository.create(input);
    const savedColumn = await this.columnRepository.save(column);

    this.kanbanGateway.emitToBoard(savedColumn.boardId, 'column:created', savedColumn);

    return savedColumn;
  }

  async update(id: string, input: UpdateColumnInput): Promise<Column> {
    const column = await this.findOne(id);
    Object.assign(column, input);
    const updatedColumn = await this.columnRepository.save(column);

    this.kanbanGateway.emitToBoard(updatedColumn.boardId, 'column:updated', updatedColumn);

    return updatedColumn;
  }

  async remove(id: string): Promise<boolean> {
    const column = await this.findOne(id);
    await this.columnRepository.softRemove(column);

    this.kanbanGateway.emitToBoard(column.boardId, 'column:deleted', {
      boardId: column.boardId,
      id: column.id,
    });

    return true;
  }
}
