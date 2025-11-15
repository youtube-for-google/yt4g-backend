import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// Define schema (SDL)
const typeDefs = `#graphql
  type Video {
    id: ID!
    title: String!
    channel: String!
    views: Int!
    cat: String!
    thumbnail: String!
  }

  type Query {
    videos: [Video!]!
  }
`;

// Provide resolvers
const resolvers = {
  Query: {
    videos: () => [
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
    ],
  },
};

// Create and start server
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4002 },
});

console.log(`🚀 YT4G GraphQL Server ready at ${url}`);
