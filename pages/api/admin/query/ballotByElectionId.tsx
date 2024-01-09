import prisma from "../../../../lib/prisma";

export async function fetchBallotByElectionId(electionId) {
  try {
    // Use Prisma Client to fetch election data
    const ballotData = await prisma.ballot.findMany({
      where: {
        election_id: parseInt(electionId)
      },
      select: {
        ballot_id: true,
        ballot_title: true,
      },
    });

    return ballotData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
