import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Card } from '../../cards/entities/card.entity';

@Entity('columns')
@ObjectType()
export class Column {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @TypeOrmColumn({ length: 100 })
  @Field()
  title: string;

  @TypeOrmColumn({ name: 'sort_order', default: 0 })
  @Field(() => Int)
  order: number;

  @TypeOrmColumn()
  @Field(() => ID)
  boardId: string;

  @ManyToOne('Board', 'columns', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  @Field(() => Board, { nullable: true })
  board?: Board;

  @OneToMany('Card', 'column', { cascade: true })
  @Field(() => [Card], { nullable: true })
  cards?: Card[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
