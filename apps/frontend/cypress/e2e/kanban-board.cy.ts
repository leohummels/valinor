describe('Kanban Board - Initial State', () => {
  it('should display the board with 3 default columns', () => {
    cy.get('[data-cy="kanban-board"]').should('be.visible');
    cy.get('[data-cy="column"]').should('have.length', 3);
  });

  it('should display the correct column titles', () => {
    cy.get('[data-cy="column-title"]').eq(0).should('contain.text', 'To Do');
    cy.get('[data-cy="column-title"]').eq(1).should('contain.text', 'In Progress');
    cy.get('[data-cy="column-title"]').eq(2).should('contain.text', 'Done');
  });

  it('should display default cards in "To Do" column', () => {
    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 2);
      cy.get('[data-cy="card-title"]').eq(0).should('contain.text', 'Task 1');
      cy.get('[data-cy="card-title"]').eq(1).should('contain.text', 'Task 2');
    });
  });

  it('should display default card in "In Progress" column', () => {
    cy.getColumnByTitle('In Progress').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
      cy.get('[data-cy="card-title"]').should('contain.text', 'Task 3');
    });
  });

  it('should display empty "Done" column with no cards message', () => {
    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
      cy.get('[data-cy="empty-column"]').should('contain.text', 'No cards');
    });
  });

  it('should display the "Add Column" button', () => {
    cy.get('[data-cy="add-column-btn"]').should('be.visible').and('contain.text', 'Add Column');
  });

  it('should display "Add Card" button in every column', () => {
    cy.get('[data-cy="column"]').each($column => {
      cy.wrap($column).find('[data-cy="add-card-btn"]').should('be.visible');
    });
  });
});
