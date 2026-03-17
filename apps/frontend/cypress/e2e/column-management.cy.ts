describe('Column Management', () => {
  it('should create a new column', () => {
    cy.get('[data-cy="column"]').should('have.length', 3);

    cy.addColumn('QA Review');

    cy.get('[data-cy="column"]').should('have.length', 4);
    cy.get('[data-cy="column-title"]').last().should('contain.text', 'QA Review');
  });

  it('should show the new column with empty state', () => {
    cy.addColumn('Backlog');

    cy.getColumnByTitle('Backlog').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
      cy.get('[data-cy="empty-column"]').should('contain.text', 'No cards');
    });
  });

  it('should not allow creating a column with empty title', () => {
    cy.get('[data-cy="add-column-btn"]').click();
    cy.get('[data-cy="column-submit-btn"]').should('be.disabled');
  });

  it('should cancel column creation without adding a column', () => {
    cy.get('[data-cy="column"]').should('have.length', 3);

    cy.get('[data-cy="add-column-btn"]').click();
    cy.get('[data-cy="column-title-input"]').type('Temporary Column');
    cy.get('[data-cy="column-cancel-btn"]').click();

    cy.get('[data-cy="column"]').should('have.length', 3);
  });

  it('should delete an empty column', () => {
    cy.get('[data-cy="column"]').should('have.length', 3);

    cy.deleteColumn('Done');

    cy.get('[data-cy="column"]').should('have.length', 2);
    cy.get('[data-cy="column-title"]').should('not.contain.text', 'Done');
  });

  it('should delete a column that has cards', () => {
    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 2);
    });

    cy.deleteColumn('To Do');

    cy.get('[data-cy="column"]').should('have.length', 2);
    cy.get('[data-cy="column-title"]').should('not.contain.text', 'To Do');
  });

  it('should show snackbar after column creation', () => {
    cy.addColumn('Testing');

    cy.contains('Column created').should('be.visible');
  });

  it('should show snackbar after column deletion', () => {
    cy.deleteColumn('Done');

    cy.contains('Column deleted').should('be.visible');
  });
});
