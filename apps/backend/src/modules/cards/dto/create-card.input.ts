import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@InputType()
export class CreateCardInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  columnId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  owner?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  attribution?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tester?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  effort?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  finishDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  deadline?: Date;
}
