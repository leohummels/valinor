import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ColumnsService } from '../columns/columns.service';
import { Column } from '../columns/entities/column.entity';
import { BoardsService } from './boards.service';
import { CreateBoardInput, UpdateBoardInput } from './dto';
import { Board } from './entities/board.entity';

@Resolver(() => Board)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly columnsService: ColumnsService
  ) {}

  @Query(() => [Board], { name: 'boards' })
  findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Query(() => Board, { name: 'board' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Board> {
    return this.boardsService.findOne(id);
  }

  @ResolveField(() => [Column])
  async columns(@Parent() board: Board): Promise<Column[]> {
    return this.columnsService.findAll(board.id);
  }

  @Mutation(() => Board)
  createBoard(@Args('input') input: CreateBoardInput): Promise<Board> {
    return this.boardsService.create(input);
  }

  @Mutation(() => Board)
  updateBoard(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBoardInput
  ): Promise<Board> {
    return this.boardsService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteBoard(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.boardsService.remove(id);
  }
}
