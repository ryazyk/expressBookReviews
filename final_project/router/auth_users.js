const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let usersWithSameName = users.filter((user)=>{
    return user.username === username
  });

  return usersWithSameName.length > 0;
}

const authenticatedUser = (username,password)=>{
  let validUsers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });

  return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).send({message: 'Book not found with the provided ISBN.'});
  }

  book.reviews[username] = review;

  res.status(200).send({message: 'Review added/updated successfully.', reviews: book.reviews});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization.username;

  if (book) {
    if (book.reviews[username]) {
      console.log(book.reviews);
      console.log(book.reviews[username]);
      delete book.reviews[username];
      res.status(200).send({message: 'Review successfully deleted.',  reviews: book.reviews});
    } else {
      res.status(404).send({message: 'No review found for this user on the provided ISBN.'});
    }
  } else {
    res.status(404).send({message: 'Book not found with the provided ISBN.'});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
