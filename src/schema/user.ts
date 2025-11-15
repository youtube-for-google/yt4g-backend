import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String
  }

  extend type Query {
    users: [User!]!
  }
`;

export const userResolvers = {
  Query: {
    users: () => [
      { id: 1, name: "Praveen", avatar: "https://placehold.co/48x48" },
      { id: 2, name: "Alice", avatar: "https://placehold.co/48x48" },
    ],
  },
};
