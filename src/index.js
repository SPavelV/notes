const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

const app = express();
app.use(helmet());

db.connect(DB_HOST);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Получаем токен пользователя из зоголовка
    const token = req.headers.authorization;

    // Пытаемся извлечь пользователя с помощью токена
    const user = getUser(token);

    console.log('user :>> ', user);

    return { models, user };
  }
});

server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => res.send('Hello World!!!'));
app.listen({ port }, () =>
  console.log(
    `GraphQl Server running at http://localhos:${port}${server.graphqlPath}`
  )
);
