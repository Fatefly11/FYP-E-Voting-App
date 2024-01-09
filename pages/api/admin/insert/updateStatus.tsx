// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      election_id,
      status,
      start_date,
      end_date,
    } = req.body;
    try {
      const updateBallot = await prisma.election.update({
        where: {
          election_id: parseInt(election_id),
        },
        data: {
          status,
          start_date,
          end_date,
        },
      });
      res.status(200).json(updateBallot);
    } catch (error) {
      res.status(403).json({ err: "Invalid data" });
    }
  }; 