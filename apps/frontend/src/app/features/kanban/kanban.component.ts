import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import type { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';

import {
  CREATE_BOARD,
  CREATE_CARD,
  CREATE_COLUMN,
  DELETE_CARD,
  DELETE_COLUMN,
  GET_BOARD,
  GET_BOARDS,
  MOVE_CARD,
  UPDATE_CARD,
  UPDATE_COLUMN,
} from '@core/graphql';
import { SocketService } from '@core/socket';
import { AddColumnDialogComponent } from './components/add-column-dialog/add-column-dialog.component';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column.component';
import { Board, Card, Column } from './models/kanban.models';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    KanbanColumnComponent,
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent implements OnInit, OnDestroy {
  private apollo = inject(Apollo);
  private socketService = inject(SocketService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private readonly subscriptions = new Subscription();
  private boardQueryRef?: QueryRef<{ board: Board }, { id: string }>;
  private activeRoomBoardId = '';

  columns: Column[] = [];
  boardId = '';

  ngOnInit(): void {
    this.socketService.connect();
    this.subscriptions.add(
      this.socketService.isConnected$.subscribe(isConnected => {
        if (isConnected && this.activeRoomBoardId) {
          this.socketService.emit('board:join', this.activeRoomBoardId);
        }
      })
    );
    this.setupSocketListeners();
    this.loadBoard();
  }

  ngOnDestroy(): void {
    this.leaveActiveBoardRoom();
    this.subscriptions.unsubscribe();
    this.socketService.disconnect();
  }

  private loadBoard(): void {
    const boardsQueryRef = this.apollo.watchQuery<{ boards: Board[] }>({ query: GET_BOARDS });

    this.subscriptions.add(
      boardsQueryRef.valueChanges.subscribe(({ data }) => {
        if (data.boards.length > 0) {
          this.activateBoard(data.boards[0].id);
          this.fetchBoardDetails(data.boards[0].id);
        } else {
          this.createDefaultBoard();
        }
      })
    );
  }

  private fetchBoardDetails(boardId: string): void {
    if (this.boardQueryRef && this.boardId === boardId) {
      void this.boardQueryRef.refetch({ id: boardId });
      return;
    }

    this.boardId = boardId;
    this.boardQueryRef = this.apollo.watchQuery<{ board: Board }, { id: string }>({
        query: GET_BOARD,
        variables: { id: boardId },
        fetchPolicy: 'network-only',
      });

    this.subscriptions.add(
      this.boardQueryRef.valueChanges.subscribe(({ data }) => {
        this.columns = (data.board.columns || [])
          .map(col => ({
            ...col,
            cards: [...(col.cards || [])].sort((a, b) => a.order - b.order),
          }))
          .sort((a, b) => a.order - b.order);
      })
    );
  }

  private createDefaultBoard(): void {
    this.apollo
      .mutate<{ createBoard: Board }>({
        mutation: CREATE_BOARD,
        variables: { input: { title: 'Kanban Board' } },
      })
      .subscribe(({ data }) => {
        if (data?.createBoard) {
          this.activateBoard(data.createBoard.id);
          this.columns = [];
          this.fetchBoardDetails(data.createBoard.id);
        }
      });
  }

  private setupSocketListeners(): void {
    for (const eventName of [
      'column:created',
      'column:updated',
      'column:deleted',
      'card:created',
      'card:updated',
      'card:moved',
      'card:deleted',
    ]) {
      this.subscriptions.add(
        this.socketService.on(eventName).subscribe(() => {
          this.syncBoardState();
        })
      );
    }
  }

  private sortColumns(): void {
    this.columns.sort((a, b) => a.order - b.order);
  }

  private sortCards(column: Column): void {
    column.cards.sort((a, b) => a.order - b.order);
  }

  onAddColumn(): void {
    const dialogRef = this.dialog.open(AddColumnDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apollo
          .mutate<{ createColumn: Column }>({
            mutation: CREATE_COLUMN,
            variables: {
              input: {
                boardId: this.boardId,
                title: result.title,
                order: this.columns.length,
              },
            },
          })
          .subscribe(({ data }) => {
            if (data?.createColumn) {
              this.columns.push({ ...data.createColumn, cards: [] });
              this.snackBar.open('Column created', 'Close', { duration: 2000 });
            }
          });
      }
    });
  }

  onColumnDeleted(columnId: string): void {
    this.apollo.mutate({ mutation: DELETE_COLUMN, variables: { id: columnId } }).subscribe(() => {
      this.columns = this.columns.filter(c => c.id !== columnId);
      this.snackBar.open('Column deleted', 'Close', { duration: 2000 });
    });
  }

  onColumnDrop(event: CdkDragDrop<Column[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.columns.forEach((col, index) => {
      col.order = index;
      this.apollo
        .mutate({
          mutation: UPDATE_COLUMN,
          variables: { id: col.id, input: { order: index } },
        })
        .subscribe();
    });
  }

  onCardMoved(event: {
    cardId: string;
    fromColumnId: string;
    toColumnId: string;
    newOrder: number;
  }): void {
    this.apollo
      .mutate({
        mutation: MOVE_CARD,
        variables: {
          id: event.cardId,
          input: {
            targetColumnId: event.toColumnId,
            newOrder: event.newOrder,
          },
        },
      })
      .subscribe();
  }

  onCardCreated(event: { columnId: string; cardData: Partial<Card> }): void {
    this.apollo
      .mutate<{ createCard: Card }>({
        mutation: CREATE_CARD,
        variables: {
          input: {
            columnId: event.columnId,
            title: event.cardData.title,
            description: event.cardData.description,
            owner: event.cardData.owner,
            attribution: event.cardData.attribution,
            tester: event.cardData.tester,
            effort: event.cardData.effort,
            deadline: event.cardData.deadline,
            finishDate: event.cardData.finishDate,
            order: event.cardData.order,
          },
        },
      })
      .subscribe(({ data }) => {
        if (data?.createCard) {
          const column = this.columns.find(c => c.id === event.columnId);
          if (column) {
            // Replace the optimistic card with the real one
            const optimisticIndex = column.cards.findIndex(c => c.id === event.cardData.id);
            if (optimisticIndex !== -1) {
              column.cards[optimisticIndex] = data.createCard;
            } else {
              column.cards.push(data.createCard);
            }
          }
          this.snackBar.open('Card created', 'Close', { duration: 2000 });
        }
      });
  }

  onCardUpdatedFromColumn(updatedCard: Card): void {
    this.apollo
      .mutate<{ updateCard: Card }>({
        mutation: UPDATE_CARD,
        variables: {
          id: updatedCard.id,
          input: {
            title: updatedCard.title,
            description: updatedCard.description,
            owner: updatedCard.owner,
            attribution: updatedCard.attribution,
            tester: updatedCard.tester,
            effort: updatedCard.effort,
            deadline: updatedCard.deadline,
            finishDate: updatedCard.finishDate,
          },
        },
      })
      .subscribe(() => {
        this.snackBar.open('Card updated', 'Close', { duration: 2000 });
      });
  }

  onCardDeletedFromColumn(event: { cardId: string; columnId: string }): void {
    this.apollo.mutate({ mutation: DELETE_CARD, variables: { id: event.cardId } }).subscribe(() => {
      const column = this.columns.find(c => c.id === event.columnId);
      if (column) {
        column.cards = column.cards.filter(c => c.id !== event.cardId);
      }
      this.snackBar.open('Card deleted', 'Close', { duration: 2000 });
    });
  }

  getConnectedLists(): string[] {
    return this.columns.map(c => `column-${c.id}`);
  }

  trackByColumnId(_index: number, column: Column): string {
    return column.id;
  }

  private activateBoard(boardId: string): void {
    if (!boardId || this.activeRoomBoardId === boardId) {
      this.boardId = boardId;
      return;
    }

    this.leaveActiveBoardRoom();

    this.boardId = boardId;
    this.activeRoomBoardId = boardId;
    this.socketService.emit('board:join', boardId);
  }

  private leaveActiveBoardRoom(): void {
    if (!this.activeRoomBoardId) {
      return;
    }

    this.socketService.emit('board:leave', this.activeRoomBoardId);
    this.activeRoomBoardId = '';
  }

  private syncBoardState(): void {
    if (!this.boardId) {
      return;
    }

    if (this.boardQueryRef) {
      void this.boardQueryRef.refetch({ id: this.boardId });
      return;
    }

    this.fetchBoardDetails(this.boardId);
  }
}
