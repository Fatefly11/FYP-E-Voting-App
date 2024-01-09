import { PrismaClient } from "@prisma/client";
//s
const prisma = new PrismaClient();

export default async (req, res) => {
    const data = req.body;
    try {
      const result = await prisma.voter.findFirst({
        where: {
          voter_token: data.verificationKey,
        },
        select: {
          election_id: true,
        },
      });
  
      if (result) {
        const electionResult = await prisma.election.findUnique({
          where: {
            election_id: result.election_id,
          },
          select: {
            election_title: true,
          },
        });
  
        res.status(200).json({
          election_title: electionResult ? electionResult.election_title : null,
        });
      } else {
        res.status(404).json({ error: "Verification key not found." });
      }
    } catch (err) {
      console.log(err);
      res.status(403).json({ err: "Error occurred while verifying." });
    }
  };