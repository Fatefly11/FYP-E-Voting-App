// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      candidate_id,
  } = req.body;
  try {
    const deleteCandidate = await prisma.candidate.delete({
      where: {
        candidate_id: parseInt(candidate_id),
      },
    });
    res.status(200).json({ message: "Candidate deleted successfully." });
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error deleting." });
  }
};