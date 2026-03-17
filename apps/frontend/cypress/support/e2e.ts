import './commands';

beforeEach(() => {
  cy.resetBoardState();
  cy.visit('/');
  cy.get('[data-cy="kanban-board"]').should('be.visible');
});
