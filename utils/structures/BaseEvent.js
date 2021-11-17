module.exports = class BaseEvent {
  constructor(name) {
    this.name = name;
   }

  run(client, ...args) { } // eslint-disable-line
};