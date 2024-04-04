//TODO: seeds script should come here, so we'll be able to put some data in our local env
const mongoose = require('mongoose');
require('../models/User'); // Path to your User model
require('../models/Item'); // Path to your Item model
require('../models/Comment'); // Path to your Comment model
const User = mongoose.model('User');
const Item = mongoose.model('Item');
const Comment = mongoose.model('Comment');
const process = require("process")

// const db = "mongodb://localhost:27017/mydatabase"; // Update the database URL as needed
const db = process.env.MONGODB_URI;

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

async function createUsers() {
  const usersData = Array.from({ length: 100 }, (_, i) => ({
    username: `user${i}`,
    email: `user${i}@example.com`,
    bio: `A bio for user${i}`,
    image: `https://example.com/user${i}.jpg`,
  }));

  for (let userData of usersData) {
    const user = new User(userData);
    user.setPassword('password');
    await user.save();
  }
}

async function createItems(users) {
  const itemsData = Array.from({ length: 100 }, (_, i) => ({
    title: `Item ${i}`,
    description: `Description for item ${i}`,
    image: `https://example.com/item${i}.jpg`,
    seller: users[i % users.length]._id, // Assign each item to a user
  }));

  for (let itemData of itemsData) {
    const item = new Item(itemData);
    await item.save();
  }
}

async function createComments(users, items) {
  const commentsData = Array.from({ length: 100 }, (_, i) => ({
    body: `Comment ${i} body text`,
    seller: users[i % users.length]._id, // Assign comment to a user
    item: items[i % items.length]._id, // Assign comment to an item
  }));

  for (let commentData of commentsData) {
    const comment = new Comment(commentData);
    await comment.save();
  }
}

async function seedDatabase() {
  await mongoose.connection.dropDatabase(); // Be careful, this line will drop the current database
  await createUsers();
  const users = await User.find();
  await createItems(users);
  const items = await Item.find();
  await createComments(users, items);
  console.log('Database seeded!');
  mongoose.connection.close();
}

seedDatabase().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
