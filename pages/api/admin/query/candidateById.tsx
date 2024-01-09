import prisma from "../../../../lib/prisma";

export async function fetchCandidateById(candidateId) {
  try {
    // Use Prisma Client to fetch candidate data
    const candidateData = await prisma.candidate.findUnique({
      where: {
        candidate_id: parseInt(candidateId)
      },
      select: {
        name: true,
        description: true,
        bio: true,
        picture: true,
      },
    });

    return candidateData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
