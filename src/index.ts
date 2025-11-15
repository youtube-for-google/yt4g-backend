import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { videoTypeDefs, videoResolvers } from "./schema/video";
import { userTypeDefs, userResolvers } from "./schema/user";
import { commentTypeDefs, commentResolvers } from "./schema/comment";
import { likeTypeDefs, likeResolvers } from "./schema/like";

async function startServer() {
  try {
    // connect to MongoDB using the URI from .env
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB Atlas");

    const typeDefs = [
      `#graphql
    type Query {
      _empty: String
    }
    type Mutation {
      _empty: String
    }
  `,
      videoTypeDefs,
      userTypeDefs,
      commentTypeDefs,
      likeTypeDefs,
    ];

    const resolvers = [
      videoResolvers,
      userResolvers,
      commentResolvers,
      likeResolvers,
    ];
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const server = new ApolloServer({ schema });

    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.PORT) || 4002 },
    });

    console.log(`GraphQL server ready at ${url}`);
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

startServer();
