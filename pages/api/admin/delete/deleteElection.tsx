// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      election_id
  } = req.body;
  try {
    const ballots = await prisma.ballot.findMany({
        where: {
            election_id: parseInt(election_id),
        },
    });

    for (const ballot of ballots) {
            await prisma.candidate.deleteMany({
                where: {
                    ballot_id: ballot.ballot_id,
                },
            });
        }
        
    const deleteAllBallots = await prisma.ballot.deleteMany({
        where: {
          election_id: parseInt(election_id),
        },
      });
    const deleteElection = await prisma.election.delete({
      where: {
        election_id: parseInt(election_id),
      },
    });
    res.status(200).json({ message: "Election deleted successfully." });
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error deleting." });
  }
};