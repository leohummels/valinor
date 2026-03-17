import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Column } from '../../columns/entities/column.entity';

@Entity('cards')
@ObjectType()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @TypeOrmColumn({ length: 100 })
  @Field()
  title: string;

  @TypeOrmColumn({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @TypeOrmColumn({ name: 'sort_order', default: 0 })
  @Field(() => Int)
  order: number;

  @TypeOrmColumn()
  @Field()
  columnId: string;

  @ManyToOne('Column', 'cards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'columnId' })
  column?: Column;

  @TypeOrmColumn({ length: 100, nullable: true })
  @Field({ nullable: true })
  owner?: string;

  @TypeOrmColumn({ length: 100, nullable: true })
  @Field({ nullable: true })
  attribution?: string;

  @TypeOrmColumn({ length: 100, nullable: true })
  @Field({ nullable: true })
  tester?: string;

  @TypeOrmColumn({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  effort?: number;

  @TypeOrmColumn({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  finishDate?: Date;

  @TypeOrmColumn({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  deadline?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
