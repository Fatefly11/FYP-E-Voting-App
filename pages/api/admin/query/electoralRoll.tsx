import prisma from "../../../../lib/prisma";

// 0. Check if election is ongoing
export async function fetchElectionStatus(electionId) {
  try {

    const status = 
    await prisma.$queryRaw`SELECT status FROM Election WHERE election_id=${electionId};`

    return status

  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}


// 1. admin view list of voters in an ongoing election (with vote status)
export async function fetchElectoralRoll(electionId) {
    try {

      const rollData = 
      await prisma.$queryRaw`SELECT User.email, User.name, Voter.voter_id, Voter.vote_status 
      FROM Voter JOIN User ON Voter.user_id=User.user_id WHERE election_id=${electionId};`

      return rollData

    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
}


// 2. admin view list of voters to select the electoral roll for an election
export async function fetchVoters(electionId) {
    try {

      const voterList = 
      await prisma.$queryRaw`SELECT User.user_id, User.name, User.email FROM User WHERE User.user_id NOT IN
      (SELECT DISTINCT User.user_id
            FROM User LEFT JOIN Voter ON User.user_id = Voter.user_id
            WHERE Voter.election_id=${electionId})
            AND User.user_id NOT IN (SELECT Admin.user_id FROM Admin)
            AND active = ${true};`
  
      return voterList

    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  }

  export async function fetchVoted(electionId) {
    try {

      const votedCount = 
      await prisma.$queryRaw`SELECT COUNT(*) as vote_status FROM Voter WHERE election_id=${electionId} and vote_status = true;`
      
      return votedCount

    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  }

  export async function fetchTotal(electionId) {
    try {

      const totalCount = 
      await prisma.$queryRaw`SELECT COUNT(*) as vote_status FROM Voter WHERE election_id=${electionId};`
      
      return totalCount

    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  }




