/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

async function main() {
  const args = process.argv.slice(2, 5);

  if (args.length !== 3) {
    console.error('Usage: node prisma/createsu.js <utorid> <email> <password>');
    process.exit(1);
  }

  const [utorid, email, password] = args;

  // check if the user exists
  const existing = await prisma.user.findUnique({
    where: { utorid: utorid },
  });
  if (existing) {
    console.error(`User with utorid "${utorid}" already exists.`);
    process.exit(1);
  }

  // create superuser
  // use bcrypt to hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const superuser = await prisma.user.create({
    data: {
      utorid: utorid,
      name: "manager",
      email: email,
      password: hashedPassword,
      role: 'manager',
      verified: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      resetToken: uuid(),
    },
  });

  const events = await prisma.event.createMany({
  data: [
    {
      name: "Event 1",
      description: "Description 1",
      location: "Location 1",
      startTime: new Date(Date.now()),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      capacity: 100,
      pointsRemain: 80,
      published: false
    },
    {
      name: "Event 2",
      description: "Description 2",
      location: "Location 2",
      startTime: new Date(Date.now()),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      capacity: 200,
      pointsRemain: 150,
      published: true
    },
    {
      name: "Event 3",
      description: "Description 3",
      location: "Location 3",
      startTime: new Date(Date.now()),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      capacity: 300,
      pointsRemain: 250,
      published: false
    }
  ]
});

  const count = await prisma.event.count();

  console.log(`superuser "${utorid}" successfully created`);
  console.log(count);
}

main();