module.exports = {
  // При запросе разрешается информация об авторе заметки
  author: async (note, args, { models }) => {
    return await models.User.findById(note.author);
  },
  // При запросе разрешается информация favoritedBy для заметки
  favoritedBy: async (note, args, { models }) => {
    return await models.User.find({ _id: { $in: note.favoritedBy } });
  }
};

// query {
//   note(id: "<YOUR_NOTE_ID_HERE>") {
//     id
//     content
//     # Информация об авторе заметки
//     author {
//       username
//       id
//     }
//   }
// }


