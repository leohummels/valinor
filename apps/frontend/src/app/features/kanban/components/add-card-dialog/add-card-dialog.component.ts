import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-card-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Card</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input
            matInput
            formControlName="title"
            placeholder="Enter card title"
            data-cy="card-title-input"
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
            placeholder="Enter card description"
            rows="3"
            data-cy="card-description-input"
          ></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Owner</mat-label>
            <input
              matInput
              formControlName="owner"
              placeholder="Card owner"
              data-cy="card-owner-input"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Attribution</mat-label>
            <input
              matInput
              formControlName="attribution"
              placeholder="Who will execute"
              data-cy="card-attribution-input"
            />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tester</mat-label>
            <input
              matInput
              formControlName="tester"
              placeholder="Who will test"
              data-cy="card-tester-input"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Effort (hours)</mat-label>
            <input
              matInput
              type="number"
              min="0"
              formControlName="effort"
              placeholder="Estimated hours"
              data-cy="card-effort-input"
            />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Deadline</mat-label>
            <input
              matInput
              [matDatepicker]="deadlinePicker"
              formControlName="deadline"
              data-cy="card-deadline-input"
            />
            <mat-datepicker-toggle matIconSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
            <mat-datepicker #deadlinePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Finish Date</mat-label>
            <input
              matInput
              [matDatepicker]="finishPicker"
              formControlName="finishDate"
              data-cy="card-finish-date-input"
            />
            <mat-datepicker-toggle matIconSuffix [for]="finishPicker"></mat-datepicker-toggle>
            <mat-datepicker #finishPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-cy="card-cancel-btn">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid"
        (click)="onSubmit()"
        data-cy="card-submit-btn"
      >
        Add
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './add-card-dialog.component.scss',
})
export class AddCardDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddCardDialogComponent>);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    owner: [''],
    attribution: [''],
    tester: [''],
    effort: [null as number | null],
    deadline: [null as Date | null],
    finishDate: [null as Date | null],
  });

  onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      this.dialogRef.close({
        ...value,
        effort: value.effort ? Number(value.effort) : undefined,
        deadline: value.deadline ? this.toDateString(value.deadline) : undefined,
        finishDate: value.finishDate ? this.toDateString(value.finishDate) : undefined,
      });
    }
  }

  private toDateString(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }
}
