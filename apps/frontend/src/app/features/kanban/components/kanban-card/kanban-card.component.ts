import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Card } from '../../models/kanban.models';
import { CardDetailDialogComponent } from '../card-detail-dialog/card-detail-dialog.component';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule, DatePipe],
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.scss',
})
export class KanbanCardComponent {
  @Input({ required: true }) card!: Card;
  @Output() deleted = new EventEmitter<string>();
  @Output() updated = new EventEmitter<Card>();

  private dialog = inject(MatDialog);
  private pointerMoved = false;

  @HostListener('pointerdown')
  onPointerDown(): void {
    this.pointerMoved = false;
  }

  @HostListener('pointermove')
  onPointerMove(): void {
    this.pointerMoved = true;
  }

  onCardClick(): void {
    if (this.pointerMoved) return;

    const dialogRef = this.dialog.open(CardDetailDialogComponent, {
      data: { ...this.card },
      width: '600px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updated.emit(result);
      }
    });
  }

  onDelete(): void {
    this.deleted.emit(this.card.id);
  }
}
