// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import { promisify } from 'util';

const prisma = new PrismaClient();

export default async (req, res) => {
  const bcrypt = require('bcrypt');

    const {
      user_id,
      hash,
      email,
    } = req.body;

    const unhashed = hash;

    try {
      const saltRounds = 10;
      const hashed = await promisify(bcrypt.hash)(unhashed, saltRounds);

      const updateUser = await prisma.user.update({
        where: {
          user_id: parseInt(user_id),
        },
        data: {
          hash: hashed,
          email,
        },
      });
      res.status(200).json(updateUser);
    } catch (error) {
      res.status(403).json({ err: "Invalid data." });
    }
  }; 