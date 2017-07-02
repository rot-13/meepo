const Document = require('camo').Document

class Entry extends Document {
  constructor() {
    super()
    this.ip = String
    this.mac = String
    this.vendor = String
    this.timestamp = Number
  }

  static collectionName() {
    return 'entries'
  }
}

class Person extends Document {
  constructor() {
    super()
    this.identifier = {
      type: String,
      unique: true
    }
    this.name = String
    this.imageUrl = String
  }

  static collectionName() {
    return 'people'
  }
}

class Device extends Document {
  constructor() {
    super()
    this.name = String
    this.person = Person
    this.blacklisted = Boolean
    this.mac = {
      type: String,
      unique: true
    }
  }

  static collectionName() {
    return 'devices'
  }
}

module.exports = { Entry, Person, Device }
