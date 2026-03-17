import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

@InputType()
export class MoveCardInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  targetColumnId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  newOrder: number;
}
