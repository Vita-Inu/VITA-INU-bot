module.exports = {
    name: 'bork',
    description: 'Bork',
    cooldown: 5,
    execute(message, args) {
      message.channel.send("BORK BORK!!!");
  },
};