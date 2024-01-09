import prisma from "../../../../lib/prisma";

export async function fetchLatestElectionId() {
  try {
    // Use Prisma Client to fetch election data
    const latestElection = await prisma.election.findFirst({
      orderBy: {
        election_id: 'desc'
      },
      select: {
        election_id: true,
      }
    });

    return latestElection;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
