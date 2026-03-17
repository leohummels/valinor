import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreateCardInput } from './create-card.input';

@InputType()
export class UpdateCardInput extends PartialType(OmitType(CreateCardInput, ['columnId'] as const)) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
