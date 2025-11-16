import { gql } from "graphql-tag";
import { User } from "../models/userModel";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String
    email: String
    provider: String
    providerId: String
  }

  extend type Query {
    users: [User!]!
    me: User
  }
`;

export const userResolvers = {
  Query: {
    users: async () => await User.find(),

    me: async (_: unknown, _args: unknown, context: any) => {
      // require a valid token
      if (!context.user) return null;

      // return fresh user data from DB, not from token
      const dbUser = await User.findById(context.user.id);

      return dbUser;
    },
  },
  Mutation: {},
};
