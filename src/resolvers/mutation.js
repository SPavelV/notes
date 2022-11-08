const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('gravatar');

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    // Если в контексте нет пользователя, выбрасываем AuthenticationError
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }

    let noteValue = {
      content: args.content,
      // Ссылаемся на mongo id автора
      author: mongoose.Types.ObjectId(user.id)
    };

    return await models.Note.create(noteValue);
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { id, content }, { models }) => {
    return await models.Note.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    // Нормализуем Email
    email = email.trim().toLowerCase();

    // Хешируем пароль
    const hashed = await bcrypt.hash(password, 10);

    // Создаем url gravatar-изображения
    const avatar = gravatar.url(email);

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });

      // Создаем и возвращаем json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    // Если пользователь не найден, выбрасываем ошибку аутентификации
    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    // Если пароли не совпадают, выбрасываем ошибку аутентификации
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }

    // Создаем и возвращаем json web token

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

// запрос на добавление юзера в GraphQL Playground
// mutation {
//   signUp(
//   username: "BeeBoop",
//   email: "robot@example.com",
//   password: "NotARobot10010!"
//   )
// }

// login
// mutation {
//   signIn(
//   username: "BeeBoop",
//   email: "robot@example.com",
`//   password: "NotARobot10010!"
`; //   )
// }
