import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateColumnInput } from './create-column.input';

@InputType()
export class UpdateColumnInput extends PartialType(
  OmitType(CreateColumnInput, ['boardId'] as const)
) {}
