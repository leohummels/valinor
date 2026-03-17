describe('Card Deletion', () => {
  it('should delete a card via context menu', () => {
    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 2);
    });

    cy.deleteCard('Task 1');

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
      cy.get('[data-cy="card-title"]').should('not.contain.text', 'Task 1');
    });
  });

  it('should keep the remaining card after deleting one', () => {
    cy.deleteCard('Task 1');

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
      cy.get('[data-cy="card-title"]').should('contain.text', 'Task 2');
    });
  });

  it('should delete the only card in a column', () => {
    cy.getColumnByTitle('In Progress').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
    });

    cy.deleteCard('Task 3');

    cy.getColumnByTitle('In Progress').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
      cy.get('[data-cy="empty-column"]').should('contain.text', 'No cards');
    });
  });

  it('should delete all cards from a column showing empty state', () => {
    cy.deleteCard('Task 1');
    cy.deleteCard('Task 2');

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
      cy.get('[data-cy="empty-column"]').should('contain.text', 'No cards');
    });
  });

  it('should delete a newly created card', () => {
    cy.addCard('Done', { title: 'Temporary Card' });

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
    });

    cy.deleteCard('Temporary Card');

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
      cy.get('[data-cy="empty-column"]').should('contain.text', 'No cards');
    });
  });
});
