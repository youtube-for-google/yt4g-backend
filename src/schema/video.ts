import { gql } from "graphql-tag";
import { Video } from "../models/videoModel";

export const videoTypeDefs = gql`
  type Video {
    id: ID!
    title: String!
    channel: String!
    views: Int!
    cat: String!
    thumbnail: String!
    uploader: User
  }

  extend type Query {
    videos(cat: String, limit: Int): [Video!]!
  }

  extend type Mutation {
    addVideo(
      title: String!
      cat: String!
      thumbnail: String!
      views: Int
    ): Video!
  }
`;

export const videoResolvers = {
  Query: {
    videos: async (_: unknown, args: { cat?: string; limit?: number }) => {
      const filter: Record<string, unknown> = {};
      if (args.cat) filter.cat = args.cat;
      const query = Video.find(filter);
      if (args.limit && args.limit > 0) query.limit(args.limit);
      return await query.exec();
    },
  },
  Mutation: {
    addVideo: async (
      _: unknown,
      args: {
        title: string;
        channel: string;
        cat: string;
        thumbnail: string;
        views?: number;
      },
      context: any
    ) => {
      // require authentication
      if (!context.user) throw new Error("Not authenticated");

      // derive uploader info from user
      const uploaderName = context.user.name;
      const uploaderId = context.user.id;

      // save video
      const vid = new Video({
        ...args,
        channel: uploaderName, // or keep separate 'uploader' field
        uploader: uploaderId,
      });
      await vid.save();

      return vid;
    },
  },
};
