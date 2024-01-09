import prisma from "../../../lib/prisma";
import { withSession } from "../../../lib/session";

export async function fetchElectionData(userID) {
  try {
    //const { userId } = req.session.get("userid"); 

    const electionData = await prisma.election.findMany({
      where: {
        Voter: {
          some: {
            user_id: userID,
            vote_status: false,
          },
        },
        status: "ONGOING",
      },
      select: {
        election_id: true,
        election_title: true,
        election_description: true,
        public_key: true,
        Ballot: {
          select: {
            ballot_id: true,
            ballot_title: true,
            Candidate: {
              select: {
                candidate_id: true,
                name: true,
                description: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    return electionData;
  } catch (err) {
    console.error("Error Occurred @voterElectionData.tsx(line 41):", err);
    throw err;
  }
};

export default withSession(fetchElectionData);