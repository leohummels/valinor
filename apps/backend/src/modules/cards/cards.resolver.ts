import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CardsService } from './cards.service';
import { CreateCardInput, MoveCardInput, UpdateCardInput } from './dto';
import { Card } from './entities/card.entity';

@Resolver(() => Card)
export class CardsResolver {
  constructor(private readonly cardsService: CardsService) {}

  @Query(() => [Card], { name: 'cards' })
  findAll(
    @Args('columnId', { type: () => ID, nullable: true }) columnId?: string
  ): Promise<Card[]> {
    return this.cardsService.findAll(columnId);
  }

  @Query(() => Card, { name: 'card' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Mutation(() => Card)
  createCard(@Args('input') input: CreateCardInput): Promise<Card> {
    return this.cardsService.create(input);
  }

  @Mutation(() => Card)
  updateCard(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCardInput
  ): Promise<Card> {
    return this.cardsService.update(id, input);
  }

  @Mutation(() => Card)
  moveCard(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: MoveCardInput
  ): Promise<Card> {
    return this.cardsService.move(id, input);
  }

  @Mutation(() => Boolean)
  deleteCard(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.cardsService.remove(id);
  }
}
