import prisma from "../../../../lib/prisma";

export async function fetchTotalShares(election_id) {
  try {
    // Use Prisma Client to fetch ballot data
    const shareCount = await prisma.share.count({
      where: {
        election_id: parseInt(election_id)
        }
    });

    return shareCount;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}