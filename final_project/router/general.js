const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username or password missing
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if username already exists
    if (!isValid(username)) {
      return res.status(400).json({ message: "User already exists!" });
    }
  
    // Add user to the users array
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  });  

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Task1
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Task2
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Task3
  const author = req.params.author;
  const keys = Object.keys(books);
  let result = [];

  keys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      result.push(books[key]);
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found by this author." });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Task4
  const title = req.params.title;
  const keys = Object.keys(books);
  let result = [];

  keys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      result.push(books[key]);
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found with this title." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Task5
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

public_users.get('/async/books', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/'); // same route as Task 1
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
  });

  public_users.get('/async/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => {
        return res.status(200).json(response.data);
      })
      .catch(err => {
        return res.status(404).json({ message: "Error fetching book by ISBN", error: err.message });
      });
  });

  public_users.get('/async/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(404).json({ message: "Error fetching books by author", error: err.message });
    }
  });

  public_users.get('/async/title/:title', (req, res) => {
    const title = req.params.title;
  
    axios.get(`http://localhost:5000/title/${title}`)
      .then(response => {
        return res.status(200).json(response.data);
      })
      .catch(err => {
        return res.status(404).json({ message: "Error fetching books by title", error: err.message });
      });
  });

module.exports.general = public_users;
