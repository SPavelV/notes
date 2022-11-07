module.exports = {
  newNote: async (parent, args, { models }) => {
    let noteValue = {
      content: args.content,
      author: 'Some Man'
    };

    return await models.Note.create(noteValue);
  }
};
