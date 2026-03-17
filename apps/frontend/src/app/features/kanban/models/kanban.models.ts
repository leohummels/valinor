export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  owner?: string;
  attribution?: string;
  tester?: string;
  effort?: number;
  finishDate?: string;
  deadline?: string;
  createdAt?: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  createdAt?: Date;
  updatedAt?: Date;
}
