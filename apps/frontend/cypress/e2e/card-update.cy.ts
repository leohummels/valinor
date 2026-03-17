describe('Card Update', () => {
  it('should open card detail dialog with pre-filled data', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-title-input"]').should('have.value', 'Task 1');
    cy.get('[data-cy="detail-description-input"]').should('have.value', 'Description 1');
  });

  it('should update the card title', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-title-input"]').clear().type('Updated Task 1');
    cy.get('[data-cy="detail-save-btn"]').click();

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card-title"]').first().should('contain.text', 'Updated Task 1');
    });
  });

  it('should update the card description', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-description-input"]').clear().type('A brand new description');
    cy.get('[data-cy="detail-save-btn"]').click();

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]')
        .first()
        .find('[data-cy="card-description"]')
        .should('contain.text', 'A brand new description');
    });
  });

  it('should add metadata fields to a card', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-owner-input"]').type('Alice');
    cy.get('[data-cy="detail-attribution-input"]').type('Bob');
    cy.get('[data-cy="detail-tester-input"]').type('Charlie');
    cy.get('[data-cy="detail-effort-input"]').type('5');
    cy.get('[data-cy="detail-save-btn"]').click();

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]')
        .first()
        .within(() => {
          cy.get('[data-cy="chip-attribution"]').should('contain.text', 'Bob');
          cy.get('[data-cy="chip-tester"]').should('contain.text', 'Charlie');
          cy.get('[data-cy="chip-effort"]').should('contain.text', '5h');
        });
    });
  });

  it('should cancel update without saving changes', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-title-input"]').clear().type('This Should Not Persist');
    cy.get('[data-cy="detail-cancel-btn"]').click();

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card-title"]').first().should('contain.text', 'Task 1');
      cy.get('[data-cy="card-title"]')
        .first()
        .should('not.contain.text', 'This Should Not Persist');
    });
  });

  it('should close detail dialog via close button', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-close-btn"]').click();

    cy.get('[data-cy="detail-title-input"]').should('not.exist');
  });

  it('should not allow saving with empty title', () => {
    cy.openCardDetail('Task 1');

    cy.get('[data-cy="detail-title-input"]').focus().type('{selectall}{del}');
    cy.get('[data-cy="detail-save-btn"]').should('be.disabled');
  });

  it('should preserve original card data after update', () => {
    cy.openCardDetail('Task 1');
    cy.get('[data-cy="detail-title-input"]')
      .invoke('val', '')
      .trigger('input')
      .should('have.value', '')
      .type('Renamed Task');
    cy.get('[data-cy="detail-save-btn"]').click();

    cy.get('mat-dialog-container').should('not.exist');

    // Verify updated card
    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card-title"]').first().should('contain.text', 'Renamed Task');
    });

    // Open again and verify data persists
    cy.openCardDetail('Renamed Task');
    cy.get('[data-cy="detail-title-input"]').should('have.value', 'Renamed Task');
  });
});
