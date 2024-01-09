// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      candidate_id,
      name,
      description,
      bio,
      picture,
    } = req.body;
    try {
      const updateCandidate = await prisma.candidate.update({
        where: {
          candidate_id: parseInt(candidate_id),
        },
        data: {
          name,
          description,
          bio,
          picture,
        },
      });
      res.status(200).json(updateCandidate);
    } catch (error) {
      res.status(403).json({ err: "Invalid data" });
    }
  }; 