import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Card } from '../../models/kanban.models';

@Component({
  selector: 'app-card-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Card Details</h2>
      <button mat-icon-button mat-dialog-close aria-label="Close" data-cy="detail-close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width title-field">
          <mat-label>Title</mat-label>
          <input
            matInput
            formControlName="title"
            placeholder="Card title"
            data-cy="detail-title-input"
          />
          @if (form.get('title')?.hasError('required')) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Describe the activity"
            rows="4"
            data-cy="detail-description-input"
          ></textarea>
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline">
            <mat-label>Owner</mat-label>
            <input
              matInput
              formControlName="owner"
              placeholder="Card owner"
              data-cy="detail-owner-input"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Attribution</mat-label>
            <input
              matInput
              formControlName="attribution"
              placeholder="Who will execute"
              data-cy="detail-attribution-input"
            />
          </mat-form-field>
        </div>

        <div class="field-row">
          <mat-form-field appearance="outline">
            <mat-label>Tester</mat-label>
            <input
              matInput
              formControlName="tester"
              placeholder="Who will test"
              data-cy="detail-tester-input"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Effort (hours)</mat-label>
            <input
              matInput
              type="number"
              min="0"
              formControlName="effort"
              placeholder="Estimated hours"
              data-cy="detail-effort-input"
            />
          </mat-form-field>
        </div>

        <div class="field-row">
          <mat-form-field appearance="outline">
            <mat-label>Deadline</mat-label>
            <input
              matInput
              [matDatepicker]="deadlinePicker"
              formControlName="deadline"
              data-cy="detail-deadline-input"
            />
            <mat-datepicker-toggle matIconSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
            <mat-datepicker #deadlinePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Finish Date</mat-label>
            <input
              matInput
              [matDatepicker]="finishPicker"
              formControlName="finishDate"
              data-cy="detail-finish-date-input"
            />
            <mat-datepicker-toggle matIconSuffix [for]="finishPicker"></mat-datepicker-toggle>
            <mat-datepicker #finishPicker></mat-datepicker>
          </mat-form-field>
        </div>

        @if (data.createdAt) {
          <p class="created-at">Created: {{ data.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-cy="detail-cancel-btn">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid"
        (click)="onSave()"
        data-cy="detail-save-btn"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './card-detail-dialog.component.scss',
})
export class CardDetailDialogComponent {
  data = inject<Card>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CardDetailDialogComponent>);

  form = this.fb.group({
    title: [this.data.title, [Validators.required]],
    description: [this.data.description ?? ''],
    owner: [this.data.owner ?? ''],
    attribution: [this.data.attribution ?? ''],
    tester: [this.data.tester ?? ''],
    effort: [this.data.effort as number | null],
    deadline: [this.data.deadline ? new Date(this.data.deadline) : (null as Date | null)],
    finishDate: [this.data.finishDate ? new Date(this.data.finishDate) : (null as Date | null)],
  });

  onSave(): void {
    if (this.form.valid) {
      const value = this.form.value;
      const result: Card = {
        id: this.data.id,
        order: this.data.order,
        createdAt: this.data.createdAt,
        title: value.title!,
        description: value.description || undefined,
        owner: value.owner || undefined,
        attribution: value.attribution || undefined,
        tester: value.tester || undefined,
        effort: value.effort != null ? Number(value.effort) : undefined,
        deadline: value.deadline ? this.toDateString(value.deadline) : undefined,
        finishDate: value.finishDate ? this.toDateString(value.finishDate) : undefined,
      };
      this.dialogRef.close(result);
    }
  }

  private toDateString(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }
}
