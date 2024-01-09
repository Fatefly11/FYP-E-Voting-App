import prisma from "../../../lib/prisma";

export async function fetchPublicKey(electionIdParam) {
  try {
    // Use Prisma Client to fetch election data
    const publickeydata = await prisma.election.findFirst({
      where:{election_id:electionIdParam}  ,
      
        select: {
        public_key: true,
        }
    });

    return publickeydata;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
