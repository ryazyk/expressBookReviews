const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const e = require("express");


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user. Login or password were not provided"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    resolve(JSON.stringify(books, null, 4));
  })
      .then(data => {
        res.send(data);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');
      });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve({status: 200, data: book});
    } else {
      reject({status: 404, message: 'Book not found with the provided ISBN.'});
    }
  })
      .then(response => {
        res.status(response.status).json(response.data);
      })
      .catch(error => {
        console.error(error.message);
        res.status(error.status).send({ message: error.message });
      });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    let booksByAuthor = [];

    for (let isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    }

    if (booksByAuthor.length) {
      resolve({status: 200, data: booksByAuthor});
    } else {
      reject({status: 404, message: 'Books not found for the provided author.'});
    }
  })
      .then(response => {
        res.status(response.status).json(response.data);
      })
      .catch(error => {
        console.error(error.message);
        res.status(error.status).send({ message: error.message });
      });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    let booksByTitle = [];

    for (let isbn in books) {
      if (books[isbn].title === title) {
        booksByTitle.push(books[isbn]);
      }
    }

    if (booksByTitle.length) {
      resolve({status: 200, data: booksByTitle});
    } else {
      reject({status: 404, message: 'Books not found for the provided title.'});
    }
  })
      .then(response => {
        res.status(response.status).json(response.data);
      })
      .catch(error => {
        console.error(error.message);
        res.status(error.status).send({ message: error.message });
      });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).send({message: 'Book not found with the provided ISBN.'});
  }
});

module.exports.general = public_users;
