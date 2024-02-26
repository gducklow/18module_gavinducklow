const connection = require('../config/connection');
const { Thought, Reaction } = require('../models');
const { getRandomReaction, getRandomUser } = require('./data');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');
    // Delete the collections if they exist
    let thoughtCheck = await connection.db.listCollections({ name: 'thoughts' }).toArray();
    if (thoughtCheck.length) {
      await connection.dropCollection('thoughts');
    }

    let reactionsCheck = await connection.db.listCollections({ name: 'reactions' }).toArray();
    if (reactionsCheck.length) {
      await connection.dropCollection('reactions');
    }


  // Create empty array to hold the students
  const reaction = [];

  // Loop 20 times -- add students to the students array
  for (let i = 0; i < 20; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const users = getRandomUsers(20);

    const fullName = getRandomName();
    const first = fullName.split(' ')[0];
    const last = fullName.split(' ')[1];
    const github = `${first}${Math.floor(Math.random() * (99 - 18 + 1) + 18)}`;

    reaction.push({
      first,
      last,
      github,
      user,
    });
  }

  // Add students to the collection and await the results
  await Reaction.collection.insertMany(reactions);

  // Add courses to the collection and await the results
  await Thought.collection.insertOne({
    courseName: 'UCLA',
    inPerson: false,
    students: [...students],
  });

  // Log out the seed data to indicate what should appear in the database
  console.table(students);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
