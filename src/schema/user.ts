import { gql } from "graphql-tag";
import { User } from "../models/userModel";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String
  }

  extend type Query {
    users: [User!]!
  }

  extend type Mutation {
    addUser(name: String!, avatar: String): User!
  }
`;

export const userResolvers = {
  Query: {
    users: async () => await User.find(),
  },
  Mutation: {
    addUser: async (_: unknown, args: { name: string; avatar?: string }) => {
      const user = new User(args);
      await user.save();
      return user;
    },
  },
};
