/// <reference types="cypress" />

export interface CardData {
  title: string;
  description?: string;
  owner?: string;
  attribution?: string;
  tester?: string;
  effort?: number;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface TestColumnSeed {
  title: string;
  cards: CardData[];
}

const graphqlUrl = 'http://localhost:3000/graphql';

const testBoardSeed: TestColumnSeed[] = [
  {
    title: 'To Do',
    cards: [
      { title: 'Task 1', description: 'Description 1' },
      { title: 'Task 2', description: 'Description 2' },
    ],
  },
  {
    title: 'In Progress',
    cards: [{ title: 'Task 3', description: 'Description 3' }],
  },
  {
    title: 'Done',
    cards: [],
  },
];

const requestGraphql = <T>(query: string, variables: Record<string, unknown> = {}) =>
  cy
    .request<GraphqlResponse<T>>({
      method: 'POST',
      url: graphqlUrl,
      headers: {
        'content-type': 'application/json',
      },
      body: { query, variables },
      retryOnNetworkFailure: true,
      retryOnStatusCodeFailure: true,
      timeout: 30000,
    })
    .then(({ body, status }) => {
      expect(status).to.eq(200);

      if (body.errors?.length) {
        throw new Error(body.errors.map(error => error.message).join('\n'));
      }

      if (!body.data) {
        throw new Error('GraphQL response did not include data.');
      }

      return body.data;
    });

const deleteAllBoards = () =>
  requestGraphql<{ boards: Array<{ id: string }> }>(`
    query GetBoardsForReset {
      boards {
        id
      }
    }
  `).then(({ boards }) =>
    boards.reduce<Cypress.Chainable<unknown>>(
      (chain, board) =>
        chain.then(() =>
          requestGraphql<{ deleteBoard: boolean }>(
            `
              mutation DeleteBoardForReset($id: ID!) {
                deleteBoard(id: $id)
              }
            `,
            { id: board.id }
          )
        ),
      cy.wrap(null, { log: false })
    )
  );

const createBoardFixture = () => {
  const columnIds = new Map<string, string>();

  return requestGraphql<{ createBoard: { id: string } }>(
    `
      mutation CreateBoardForReset($input: CreateBoardInput!) {
        createBoard(input: $input) {
          id
        }
      }
    `,
    { input: { title: 'Kanban Board' } }
  )
    .then(({ createBoard }) =>
      testBoardSeed.reduce<Cypress.Chainable<unknown>>(
        (chain, column, order) =>
          chain.then(() =>
            requestGraphql<{ createColumn: { id: string } }>(
              `
                mutation CreateColumnForReset($input: CreateColumnInput!) {
                  createColumn(input: $input) {
                    id
                  }
                }
              `,
              {
                input: {
                  boardId: createBoard.id,
                  title: column.title,
                  order,
                },
              }
            ).then(({ createColumn }) => {
              columnIds.set(column.title, createColumn.id);
            })
          ),
        cy.wrap(null, { log: false })
      )
    )
    .then(() =>
      testBoardSeed.reduce<Cypress.Chainable<unknown>>(
        (columnChain, column) =>
          columnChain.then(() => {
            const columnId = columnIds.get(column.title);

            if (!columnId) {
              throw new Error(`Missing seeded column id for ${column.title}`);
            }

            return column.cards.reduce<Cypress.Chainable<unknown>>(
              (cardChain, card, order) =>
                cardChain.then(() =>
                  requestGraphql<{ createCard: { id: string } }>(
                    `
                      mutation CreateCardForReset($input: CreateCardInput!) {
                        createCard(input: $input) {
                          id
                        }
                      }
                    `,
                    {
                      input: {
                        columnId,
                        title: card.title,
                        description: card.description,
                        owner: card.owner,
                        attribution: card.attribution,
                        tester: card.tester,
                        effort: card.effort,
                        order,
                      },
                    }
                  )
                ),
              cy.wrap(null, { log: false })
            );
          }),
        cy.wrap(null, { log: false })
      )
    );
};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Add a new column to the board
       */
      addColumn(title: string): Chainable<void>;

      /**
       * Add a new card to a column identified by its title
       */
      addCard(columnTitle: string, cardData: CardData): Chainable<void>;

      /**
       * Open the card detail dialog by clicking a card
       */
      openCardDetail(cardTitle: string): Chainable<void>;

      /**
       * Delete a card via its context menu
       */
      deleteCard(cardTitle: string): Chainable<void>;

      /**
       * Delete a column via its context menu
       */
      deleteColumn(columnTitle: string): Chainable<void>;

      /**
       * Get a column element by its title
       */
      getColumnByTitle(title: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Reset the board to a deterministic state before each test
       */
      resetBoardState(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('resetBoardState', () => {
  return deleteAllBoards().then(() => createBoardFixture());
});

Cypress.Commands.add('addColumn', (title: string) => {
  cy.get('[data-cy="add-column-btn"]').click();
  cy.get('[data-cy="column-title-input"]').type(title);
  cy.get('[data-cy="column-submit-btn"]').click();
  cy.get('mat-dialog-container').should('not.exist');
});

Cypress.Commands.add('getColumnByTitle', (title: string) => {
  return cy
    .get('[data-cy="column"]')
    .filter(`:has([data-cy="column-title"]:contains("${title}"))`)
    .first();
});

Cypress.Commands.add('addCard', (columnTitle: string, cardData: CardData) => {
  cy.getColumnByTitle(columnTitle).find('[data-cy="add-card-btn"]').click();

  cy.get('[data-cy="card-title-input"]').should('be.visible').type(cardData.title);

  if (cardData.description) {
    cy.get('[data-cy="card-description-input"]').type(cardData.description);
  }
  if (cardData.owner) {
    cy.get('[data-cy="card-owner-input"]').type(cardData.owner, { force: true });
  }
  if (cardData.attribution) {
    cy.get('[data-cy="card-attribution-input"]').type(cardData.attribution, { force: true });
  }
  if (cardData.tester) {
    cy.get('[data-cy="card-tester-input"]').type(cardData.tester, { force: true });
  }
  if (cardData.effort !== undefined) {
    cy.get('[data-cy="card-effort-input"]').type(cardData.effort.toString(), { force: true });
  }

  cy.get('[data-cy="card-submit-btn"]').click();
  cy.get('mat-dialog-container').should('not.exist');
});

Cypress.Commands.add('openCardDetail', (cardTitle: string) => {
  cy.get('[data-cy="card"]')
    .filter(`:has([data-cy="card-title"]:contains("${cardTitle}"))`)
    .first()
    .click();
  cy.get('[data-cy="detail-title-input"]').should('be.visible');
});

Cypress.Commands.add('deleteCard', (cardTitle: string) => {
  cy.get('[data-cy="card"]')
    .filter(`:has([data-cy="card-title"]:contains("${cardTitle}"))`)
    .first()
    .find('[data-cy="card-menu-btn"]')
    .click({ force: true });
  cy.get('[data-cy="delete-card-btn"]').click();
});

Cypress.Commands.add('deleteColumn', (columnTitle: string) => {
  cy.getColumnByTitle(columnTitle).find('[data-cy="column-menu-btn"]').click();
  cy.get('[data-cy="delete-column-btn"]').click();
});
