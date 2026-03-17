import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardInput, UpdateBoardInput } from './dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>
  ) {}

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find({
      relations: ['columns', 'columns.cards'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    return board;
  }

  async create(input: CreateBoardInput): Promise<Board> {
    const board = this.boardRepository.create(input);
    return this.boardRepository.save(board);
  }

  async update(id: string, input: UpdateBoardInput): Promise<Board> {
    const board = await this.findOne(id);
    Object.assign(board, input);
    return this.boardRepository.save(board);
  }

  async remove(id: string): Promise<boolean> {
    const board = await this.findOne(id);
    await this.boardRepository.softRemove(board);
    return true;
  }
}
