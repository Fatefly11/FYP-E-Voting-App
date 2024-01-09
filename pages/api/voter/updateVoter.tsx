// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import { withSession } from '../../../lib/session';

const prisma = new PrismaClient();

export default withSession(async function handler(req, res) {
  const data = req.body;
  const electionID = data.election_id;
  //console.log("updateVoter.tsx(Line_10) electionID test:",electionID);
  const userID = req.session.get('userid');
  const voterToken = generateRandomHex(8);

  try {
    const voter = await prisma.voter.findFirst({
        where: {
          user_id: userID,
          election_id: electionID,
        },
      });
    
    if (voter) {
        const result = await prisma.voter.update({
            where: {
                voter_id: voter.voter_id,
            },
            data: {
                vote_status: true,
                voter_token: voterToken,
            },
        });
        res.status(200).json(voterToken);
    }
    
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new candidate." });
  }
});

function generateRandomHex(length) {
  const characters = "0123456789ABCDEF";
  let hexString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    hexString += characters[randomIndex];
  }

  return hexString;
}