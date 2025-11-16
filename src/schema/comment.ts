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
    addComment(videoId: ID!, text: String!): Comment!
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
      args: { videoId: string; text: string },
      context: any
    ) => {
      // require an authenticated user
      if (!context.user) throw new Error("Not authenticated");

      const authorId = context.user.id;

      // create comment tied to the logged‑in user
      const comment = new Comment({
        text: args.text,
        author: authorId,
        videoId: args.videoId,
      });

      await comment.save();

      //populate author details for immediate return
      return await comment.populate("author");
    },
  },
};
