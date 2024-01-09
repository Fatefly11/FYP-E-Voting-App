// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import { promisify } from 'util';

const prisma = new PrismaClient();


export default async (req, res) => {
  const data = req.body;
  const unhashed = data.hash;
  const bcrypt = require('bcrypt');
  try {
    const saltRounds = 10;
    const hash = await promisify(bcrypt.hash)(unhashed, saltRounds);

    console.log('createUser.tsx(line 17) Hashed Password Test:', hash);

    const dataWithHash = {
      ...data,
      hash: hash,
    };

    // Create a user using a promise-based approach
    const createUserPromise = prisma.user.create({
      data: dataWithHash,
    });

    // Wait for the user creation promise to resolve
    const result = await createUserPromise;

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Username already exists." });
  }
};