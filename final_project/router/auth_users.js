const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let validUsers = users.filter((user) => user.username === username);
    return validUsers.length === 0;
};

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter(
        (user) => user.username === username && user.password === password
      );
      return validUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Check if username/password provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Authenticate user
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 3600 });
      req.session.authorization = { accessToken, username };
      return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
      return res.status(403).json({ message: "Invalid Login. Check username and password." });
    }
  });
  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required." });
  }

  if (books[isbn]) {
    // Add or modify review for the current user
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: `Review for book ${isbn} added/updated successfully.` });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

//Delete a book review (by logged-in user)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (books[isbn]) {
      let userReviews = books[isbn].reviews;
      if (userReviews[username]) {
        delete userReviews[username];
        return res.status(200).json({ message: `Review by ${username} deleted successfully.` });
      } else {
        return res.status(404).json({ message: "No review found for this user." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
