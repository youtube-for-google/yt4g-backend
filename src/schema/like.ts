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
    likeVideo(videoId: ID!): Boolean
  }
`;

export const likeResolvers = {
  Query: {
    likes: async (_: unknown, args: { videoId: string }) =>
      await Like.countDocuments({ videoId: args.videoId }),
  },
  Mutation: {
    likeVideo: async (_: unknown, args: { videoId: string }, context: any) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const userId = context.user.id;
      const videoId = args.videoId;

      const existing = await Like.findOne({
        videoId,
        userId,
      });

      if (existing) {
        await Like.deleteOne({ _id: existing._id });
        return false; // unliked
      }

      const like = new Like({ videoId, userId });
      await like.save();
      return true;
    },
  },
};
