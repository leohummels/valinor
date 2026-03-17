describe('Card Creation', () => {
  it('should create a card with title only', () => {
    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
    });

    cy.addCard('Done', { title: 'New Card' });

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
      cy.get('[data-cy="card-title"]').should('contain.text', 'New Card');
    });
  });

  it('should create a card with all fields filled', () => {
    cy.getColumnByTitle('Done').find('[data-cy="add-card-btn"]').click();

    cy.get('[data-cy="card-title-input"]').should('be.visible').type('Full Card');
    cy.get('[data-cy="card-description-input"]').click().type('Complete description of the task');
    cy.get('[data-cy="card-owner-input"]').click().type('Alice');
    cy.get('[data-cy="card-attribution-input"]').click().type('Bob');
    cy.get('[data-cy="card-tester-input"]').click().type('Charlie');
    cy.get('[data-cy="card-effort-input"]').click().type('8');
    cy.get('[data-cy="card-submit-btn"]').click();
    cy.get('mat-dialog-container').should('not.exist');

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 1);
      cy.get('[data-cy="card-title"]').should('contain.text', 'Full Card');
      cy.get('[data-cy="card-description"]').should(
        'contain.text',
        'Complete description of the task'
      );
      cy.get('[data-cy="chip-attribution"]').should('contain.text', 'Bob');
      cy.get('[data-cy="chip-tester"]').should('contain.text', 'Charlie');
      cy.get('[data-cy="chip-effort"]').should('contain.text', '8h');
    });
  });

  it('should not allow creating a card with empty title', () => {
    cy.getColumnByTitle('Done').find('[data-cy="add-card-btn"]').click();
    cy.get('[data-cy="card-submit-btn"]').should('be.disabled');
  });

  it('should cancel card creation without adding a card', () => {
    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
    });

    cy.getColumnByTitle('Done').find('[data-cy="add-card-btn"]').click();
    cy.get('[data-cy="card-title-input"]').type('Should Not Exist');
    cy.get('[data-cy="card-cancel-btn"]').click();

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 0);
    });
  });

  it('should add a card to a column that already has cards', () => {
    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 2);
    });

    cy.addCard('To Do', { title: 'Task 4' });

    cy.getColumnByTitle('To Do').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 3);
      cy.get('[data-cy="card-title"]').last().should('contain.text', 'Task 4');
    });
  });

  it('should create multiple cards in sequence', () => {
    cy.addCard('Done', { title: 'First Card' });
    cy.addCard('Done', { title: 'Second Card' });

    cy.getColumnByTitle('Done').within(() => {
      cy.get('[data-cy="card"]').should('have.length', 2);
      cy.get('[data-cy="card-title"]').eq(0).should('contain.text', 'First Card');
      cy.get('[data-cy="card-title"]').eq(1).should('contain.text', 'Second Card');
    });
  });
});
