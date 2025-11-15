import { gql } from "graphql-tag";

export const videoTypeDefs = gql`
  type Video {
    id: ID!
    title: String!
    channel: String!
    views: Int!
    cat: String!
    thumbnail: String!
  }

  extend type Query {
    videos(cat: String, limit: Int): [Video!]!
  }
`;

export const videoResolvers = {
  Query: {
    videos: (_: unknown, args: { cat?: string; limit?: number }) => {
      let results = allVideos;
      if (args.cat) {
        results = results.filter(
          (v) => v.cat.toLowerCase() === args.cat!.toLowerCase()
        );
      }
      if (args.limit && args.limit > 0) {
        results = results.slice(0, args.limit);
      }
      return results;
    },
  },
};

const allVideos = [
  {
    id: 1,
    title: "Building Microfrontends",
    channel: "Praveen Codes",
    views: 54200,
    cat: "Tech",
    thumbnail: "https://placehold.co/320x180/202020/FFF?text=Thumb+1",
  },
  {
    id: 2,
    title: "Heap Sort In Action",
    channel: "Algo Lab",
    views: 209000,
    cat: "Tech",
    thumbnail: "https://placehold.co/320x180/202020/FFF?text=Thumb+2",
  },
  {
    id: 3,
    title: "Lo-Fi Beats Playlist",
    channel: "Zen Beats",
    views: 380000,
    cat: "Music",
    thumbnail: "https://placehold.co/320x180/202020/FFF?text=Thumb+3",
  },
];
