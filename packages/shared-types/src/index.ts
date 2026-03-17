export interface IBoard {
  id: string;
  title: string;
  columns?: IColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IColumn {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards?: ICard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateBoardDto {
  title: string;
}

export interface UpdateBoardDto {
  title?: string;
}

export interface CreateColumnDto {
  title: string;
  boardId: string;
  order?: number;
}

export interface UpdateColumnDto {
  title?: string;
  order?: number;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  columnId: string;
  order?: number;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  order?: number;
}

export interface MoveCardDto {
  targetColumnId: string;
  newOrder: number;
}

// Socket Events
export enum KanbanEvents {
  BOARD_CREATED = 'board:created',
  BOARD_UPDATED = 'board:updated',
  BOARD_DELETED = 'board:deleted',
  COLUMN_CREATED = 'column:created',
  COLUMN_UPDATED = 'column:updated',
  COLUMN_DELETED = 'column:deleted',
  CARD_CREATED = 'card:created',
  CARD_UPDATED = 'card:updated',
  CARD_MOVED = 'card:moved',
  CARD_DELETED = 'card:deleted',
}
