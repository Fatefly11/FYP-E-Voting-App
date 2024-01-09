import prisma from "../../../../lib/prisma";

export async function fetchBallotById(ballotId) {
  try {
    // Use Prisma Client to fetch ballot data
    const ballotData = await prisma.ballot.findUnique({
      where: {
        ballot_id: parseInt(ballotId)
      },
      select: {
        ballot_title: true,
        ballot_description: true,
      },
    });

    return ballotData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
