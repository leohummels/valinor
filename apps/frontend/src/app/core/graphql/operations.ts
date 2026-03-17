import { gql } from 'apollo-angular';

// Board Queries
export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      title
      columns {
        id
        title
        order
        cards {
          id
          title
          description
          order
          owner
          attribution
          tester
          effort
          finishDate
          deadline
          createdAt
        }
      }
    }
  }
`;

// Board Mutations
export const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {
    updateBoard(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`;

// Column Mutations
export const CREATE_COLUMN = gql`
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      id
      title
      order
    }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: ID!, $input: UpdateColumnInput!) {
    updateColumn(id: $id, input: $input) {
      id
      title
      order
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: ID!) {
    deleteColumn(id: $id)
  }
`;

// Card Mutations
export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id
      title
      description
      order
      owner
      attribution
      tester
      effort
      finishDate
      deadline
      createdAt
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $input: UpdateCardInput!) {
    updateCard(id: $id, input: $input) {
      id
      title
      description
      order
      owner
      attribution
      tester
      effort
      finishDate
      deadline
      createdAt
    }
  }
`;

export const MOVE_CARD = gql`
  mutation MoveCard($id: ID!, $input: MoveCardInput!) {
    moveCard(id: $id, input: $input) {
      id
      order
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
  }
`;
