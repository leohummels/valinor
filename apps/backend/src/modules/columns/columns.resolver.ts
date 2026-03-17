import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/entities/card.entity';
import { ColumnsService } from './columns.service';
import { CreateColumnInput, UpdateColumnInput } from './dto';
import { Column } from './entities/column.entity';

@Resolver(() => Column)
export class ColumnsResolver {
  constructor(
    private readonly columnsService: ColumnsService,
    private readonly cardsService: CardsService
  ) {}

  @Query(() => [Column], { name: 'columns' })
  findAll(
    @Args('boardId', { type: () => ID, nullable: true }) boardId?: string
  ): Promise<Column[]> {
    return this.columnsService.findAll(boardId);
  }

  @Query(() => Column, { name: 'column' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Column> {
    return this.columnsService.findOne(id);
  }

  @ResolveField(() => [Card])
  async cards(@Parent() column: Column): Promise<Card[]> {
    return this.cardsService.findAll(column.id);
  }

  @Mutation(() => Column)
  createColumn(@Args('input') input: CreateColumnInput): Promise<Column> {
    return this.columnsService.create(input);
  }

  @Mutation(() => Column)
  updateColumn(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateColumnInput
  ): Promise<Column> {
    return this.columnsService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteColumn(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.columnsService.remove(id);
  }
}
