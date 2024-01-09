import prisma from "../../../../lib/prisma";

export async function fetchCandidateByBallotId(ballotId) {
  try {
    // Use Prisma Client to fetch election data
    const candidateData = await prisma.candidate.findMany({
      where: {
        ballot_id: parseInt(ballotId)
      },
      select: {
        candidate_id: true,
        name: true,
      },
    });

    return candidateData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
