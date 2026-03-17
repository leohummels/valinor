import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { SeedService } from './config/seed.service';
import { getTypeOrmConfig } from './config/typeorm.config';
import { GatewaysModule } from './gateways/gateways.module';
import { BoardsModule } from './modules/boards/boards.module';
import { Board } from './modules/boards/entities/board.entity';
import { CardsModule } from './modules/cards/cards.module';
import { Card } from './modules/cards/entities/card.entity';
import { ColumnsModule } from './modules/columns/columns.module';
import { Column } from './modules/columns/entities/column.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TypeOrmModule.forFeature([Board, Column, Card]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get<string>('NODE_ENV') !== 'production',
        introspection: configService.get<string>('NODE_ENV') !== 'production',
        subscriptions: {
          'graphql-ws': true,
        },
      }),
    }),
    GatewaysModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
