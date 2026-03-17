import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanGateway } from '../../gateways/kanban.gateway';
import { Column } from '../columns/entities/column.entity';
import { CreateCardInput, MoveCardInput, UpdateCardInput } from './dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
    private readonly kanbanGateway: KanbanGateway
  ) {}

  async findAll(columnId?: string): Promise<Card[]> {
    const where = columnId ? { columnId } : {};
    return this.cardRepository.find({
      where,
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID "${id}" not found`);
    }

    return card;
  }

  async create(input: CreateCardInput): Promise<Card> {
    if (input.order === undefined) {
      const count = await this.cardRepository.count({
        where: { columnId: input.columnId },
      });
      input.order = count;
    }

    const card = this.cardRepository.create(input);
    const savedCard = await this.cardRepository.save(card);
    const boardId = await this.getBoardIdByColumnId(savedCard.columnId);

    this.kanbanGateway.emitToBoard(boardId, 'card:created', savedCard);

    return savedCard;
  }

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    const card = await this.findOne(id);
    Object.assign(card, input);
    const updatedCard = await this.cardRepository.save(card);
    const boardId = await this.getBoardIdByColumnId(updatedCard.columnId);

    this.kanbanGateway.emitToBoard(boardId, 'card:updated', updatedCard);

    return updatedCard;
  }

  async move(id: string, input: MoveCardInput): Promise<Card> {
    const card = await this.findOne(id);
    const fromColumnId = card.columnId;
    const boardId = await this.getBoardIdByColumnId(input.targetColumnId);

    // Update cards in the target column
    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set({ order: () => '"sort_order" + 1' })
      .where('"columnId" = :columnId AND "sort_order" >= :newOrder', {
        columnId: input.targetColumnId,
        newOrder: input.newOrder,
      })
      .execute();

    // Move the card
    card.columnId = input.targetColumnId;
    card.order = input.newOrder;

    const movedCard = await this.cardRepository.save(card);

    this.kanbanGateway.emitToBoard(boardId, 'card:moved', {
      boardId,
      cardId: movedCard.id,
      fromColumnId,
      toColumnId: movedCard.columnId,
      newOrder: movedCard.order,
    });

    return movedCard;
  }

  async remove(id: string): Promise<boolean> {
    const card = await this.findOne(id);
    const boardId = await this.getBoardIdByColumnId(card.columnId);

    await this.cardRepository.softRemove(card);

    this.kanbanGateway.emitToBoard(boardId, 'card:deleted', {
      boardId,
      cardId: card.id,
      columnId: card.columnId,
    });

    return true;
  }

  private async getBoardIdByColumnId(columnId: string): Promise<string> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      select: { id: true, boardId: true },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID "${columnId}" not found`);
    }

    return column.boardId;
  }
}
