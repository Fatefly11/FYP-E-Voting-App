// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      ballot_id,
      ballot_title,
      ballot_description,
    } = req.body;
    try {
      const updateBallot = await prisma.ballot.update({
        where: {
          ballot_id: parseInt(ballot_id),
        },
        data: {
          ballot_title,
          ballot_description,
        },
      });
      res.status(200).json(updateBallot);
    } catch (error) {
      res.status(403).json({ err: "Invalid data" });
    }
  }; 