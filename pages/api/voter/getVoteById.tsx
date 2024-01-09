import prisma from "../../../lib/prisma";

export async function fetchVoteById(voteId) {
  try {
    // Use Prisma Client to fetch ballot data
    const voteData = await prisma.vote.findMany({
      where: {
        vote_id: parseInt(voteId)
      },
      select: {
        // vote_id: true,
        vote_data: true
      },
    });

    return voteData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
