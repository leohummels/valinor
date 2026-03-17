import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Card, Column } from '../../models/kanban.models';
import { AddCardDialogComponent } from '../add-card-dialog/add-card-dialog.component';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    KanbanCardComponent,
  ],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.scss',
})
export class KanbanColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input() connectedLists: string[] = [];

  @Output() deleted = new EventEmitter<string>();
  @Output() cardUpdated = new EventEmitter<Card>();
  @Output() cardCreated = new EventEmitter<{ columnId: string; cardData: Partial<Card> }>();
  @Output() cardDeleted = new EventEmitter<{ cardId: string; columnId: string }>();
  @Output() cardMoved = new EventEmitter<{
    cardId: string;
    fromColumnId: string;
    toColumnId: string;
    newOrder: number;
  }>();

  private dialog = inject(MatDialog);

  get listId(): string {
    return `column-${this.column.id}`;
  }

  onAddCard(): void {
    const dialogRef = this.dialog.open(AddCardDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const tempId = Date.now().toString();
        const newCard: Card = {
          id: tempId,
          order: this.column.cards.length,
          ...result,
        };
        this.column.cards.push(newCard);
        this.cardCreated.emit({
          columnId: this.column.id,
          cardData: { ...newCard },
        });
      }
    });
  }

  onDeleteColumn(): void {
    this.deleted.emit(this.column.id);
  }

  onCardDeleted(cardId: string): void {
    this.column.cards = this.column.cards.filter(c => c.id !== cardId);
    this.cardDeleted.emit({ cardId, columnId: this.column.id });
  }

  onCardUpdated(updatedCard: Card): void {
    const index = this.column.cards.findIndex(c => c.id === updatedCard.id);
    if (index !== -1) {
      this.column.cards[index] = updatedCard;
    }
    this.cardUpdated.emit(updatedCard);
  }

  onDrop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const card = event.container.data[event.currentIndex];
      const fromColumnId = event.previousContainer.id.replace('column-', '');
      const toColumnId = this.column.id;

      this.cardMoved.emit({
        cardId: card.id,
        fromColumnId,
        toColumnId,
        newOrder: event.currentIndex,
      });
    }

    // Update order for all cards
    this.column.cards.forEach((card, index) => {
      card.order = index;
    });
  }

  trackByCardId(_index: number, card: Card): string {
    return card.id;
  }
}
