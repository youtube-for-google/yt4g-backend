import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { videoTypeDefs, videoResolvers } from "./schema/video";
import { userTypeDefs, userResolvers } from "./schema/user";
import { commentTypeDefs, commentResolvers } from "./schema/comment";

const typeDefs = [
  `#graphql
    type Query {
      _empty: String
    }
  `,
  videoTypeDefs,
  userTypeDefs,
  commentTypeDefs,
];

const resolvers = [videoResolvers, userResolvers, commentResolvers];

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });

// ← wrap inside an async IIFE
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 },
  });
  console.log(`GraphQL server ready at ${url}`);
}

startServer();
