import prisma from "../../../../lib/prisma";

// 1. Display values in the form
export async function fetchElectionById(electionId) {
    try {
      // Use Prisma Client to fetch candidate data
      const electionData = await prisma.election.findUnique({
        where: {
          election_id: parseInt(electionId)
        },
        select: {
          election_id: true,
          election_title: true,
          election_description: true,
          status: true,
          start_date: true,
          end_date: true,
        },
      });
  
      return electionData;
    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  } 

  export async function fetchElectionAndBallotsById(electionId) {
    try {
      // Use Prisma Client to fetch candidate data
      const electionData = await prisma.election.findFirst({
        where: {
          election_id: parseInt(electionId)
        },
        select: {
          election_id: true,
          election_title: true,
          election_description: true,
          status: true,
          // start_date: true,
          // end_date: true,
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

                }
              },
            }
          },
          Voter: {
            select: {
              voter_id: true,
              vote_status: true,
            }
          }
      }});
  
      return electionData;
    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  } 
/* Additional method of querying
export async function fetchElectionData(electionId) {
  try {

    const status = 
    await prisma.$queryRaw`SELECT Election.election_title, Election.election_description FROM Election WHERE election_id=${electionId};`

    return status
    
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}  
*/


