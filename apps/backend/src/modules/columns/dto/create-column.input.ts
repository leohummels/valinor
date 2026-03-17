import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateColumnInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  boardId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
