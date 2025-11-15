import { gql } from "graphql-tag";
import { Like } from "../models/likeModel";

export const likeTypeDefs = gql`
  type Like {
    id: ID!
    userId: ID!
    videoId: ID!
  }

  extend type Query {
    likes(videoId: ID!): Int!
  }

  extend type Mutation {
    likeVideo(videoId: ID!, userId: ID!): Boolean
  }
`;

export const likeResolvers = {
  Query: {
    likes: async (_: unknown, args: { videoId: string }) =>
      await Like.countDocuments({ videoId: args.videoId }),
  },
  Mutation: {
    likeVideo: async (
      _: unknown,
      args: { videoId: string; userId: string }
    ) => {
      const existing = await Like.findOne({
        videoId: args.videoId,
        userId: args.userId,
      });
      if (existing) {
        await Like.deleteOne({ _id: existing._id });
        return false; // unliked
      } else {
        await new Like(args).save();
        return true; // liked
      }
    },
  },
};
