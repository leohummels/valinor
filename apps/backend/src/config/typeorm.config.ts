import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Board } from '../modules/boards/entities/board.entity';
import { Card } from '../modules/cards/entities/card.entity';
import { Column } from '../modules/columns/entities/column.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>(
    'DB_HOST',
    'dpg-d6rh8vea2pns73ahk5u0-a.virginia-postgres.render.com'
  ),
  port: configService.get<number>('DB_PORT', 5432),
  database: configService.get<string>('DB_NAME', 'redlamp'),
  username: configService.get<string>('DB_USERNAME', 'redlamp_user'),
  password: configService.get<string>('DB_PASSWORD', '1O7LDRY7MgNFZWKKGJs5ylYQTEEbZmRi'),
  ssl: { rejectUnauthorized: false },
  entities: [Board, Column, Card],
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') !== 'production',
});

// For CLI migrations (if needed later)
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'dpg-d6rh8vea2pns73ahk5u0-a.virginia-postgres.render.com',
  port: 5432,
  database: 'redlamp',
  username: 'redlamp_user',
  password: '1O7LDRY7MgNFZWKKGJs5ylYQTEEbZmRi',
  ssl: { rejectUnauthorized: false },
  entities: [Board, Column, Card],
  synchronize: true,
  logging: true,
};
