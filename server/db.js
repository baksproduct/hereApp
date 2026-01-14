const Datastore = require('nedb-promises');
const CryptoJS = require('crypto-js');
const path = require('path');
require('dotenv').config();

const SECRET_KEY = process.env.DB_SECRET;

const afterSerialization = (plaintext) => {
  return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
};

const beforeDeserialization = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Baza de date Users
const usersDb = Datastore.create({
  filename: path.join(__dirname, 'data', 'users.db'),
  autoload: true,
  afterSerialization,
  beforeDeserialization
});

// Baza de date Posts (NOU)
const postsDb = Datastore.create({
  filename: path.join(__dirname, 'data', 'posts.db'),
  autoload: true,
  afterSerialization,
  beforeDeserialization
});

module.exports = { usersDb, postsDb };