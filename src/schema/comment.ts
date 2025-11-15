import { gql } from "graphql-tag";
import { Comment } from "../models/commentModel";

export const commentTypeDefs = gql`
  type Comment {
    id: ID!
    text: String!
    author: User!
    videoId: ID!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    comments(videoId: ID!): [Comment!]!
  }

  extend type Mutation {
    addComment(videoId: ID!, authorId: ID!, text: String!): Comment!
  }
`;

export const commentResolvers = {
  Query: {
    comments: async (_: unknown, args: { videoId: string }) =>
      await Comment.find({ videoId: args.videoId }).populate("author"),
  },
  Mutation: {
    addComment: async (
      _: unknown,
      args: { videoId: string; authorId: string; text: string }
    ) => {
      const comment = new Comment({
        text: args.text,
        author: args.authorId,
        videoId: args.videoId,
      });
      await comment.save();
      return await comment.populate("author");
    },
  },
};
