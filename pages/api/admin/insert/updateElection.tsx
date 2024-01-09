// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      election_id,
      election_title,
      election_description,
    } = req.body;
    try {
      const updateElection = await prisma.election.update({
        where: {
          election_id: parseInt(election_id),
        },
        data: {
          election_title,
          election_description,
        },
      });
      res.status(200).json(updateElection);
    } catch (error) {
      res.status(403).json({ err: "Election Title already exists." });
    }
  }; 