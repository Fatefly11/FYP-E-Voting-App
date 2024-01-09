// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      ballot_id,
  } = req.body;
  try {
    const deleteAllCandidates = await prisma.candidate.deleteMany({
      where: {
        ballot_id: parseInt(ballot_id),
      },
    });
    const deleteBallot = await prisma.ballot.delete({
      where: {
        ballot_id: parseInt(ballot_id),
      },
    });
    res.status(200).json({ message: "Ballot deleted successfully." });
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error deleting." });
  }
};