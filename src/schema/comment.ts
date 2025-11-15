import { gql } from "graphql-tag";

export const commentTypeDefs = gql`
  type Comment {
    id: ID!
    text: String!
    author: User!
    videoId: ID!
  }

  extend type Query {
    comments(videoId: ID!): [Comment!]!
  }
`;

export const commentResolvers = {
  Query: {
    comments: (_: unknown, args: { videoId: string }) => [
      {
        id: 1,
        text: "Great video!",
        author: {
          id: 1,
          name: "Praveen",
          avatar: "https://placehold.co/48x48",
        },
        videoId: args.videoId,
      },
      {
        id: 2,
        text: "Loved the explanation",
        author: { id: 2, name: "Alice", avatar: "https://placehold.co/48x48" },
        videoId: args.videoId,
      },
    ],
  },
};
