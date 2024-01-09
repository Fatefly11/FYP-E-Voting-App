import prisma from "../../../../lib/prisma";

export async function fetchElectionData() {
  try {
    // Use Prisma Client to fetch election data
    const electionData = await prisma.election.findMany({
      // take: 10,
      select: {
        election_id: true,
        election_title: true,
        status: true,
        Ballot: {
          select: {
            Candidate: {
              select: {
                candidate_id: true,
                name: true,
                description: true,
                picture: true,
              },
            }
          }
        },
        Voter: {
          select: {
            voter_id: true,
          }
        }
      },
    });

    return electionData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

// import connection from '../../lib/db'

// //username: voter; password: cee3bffe766faee7bd70c65a4f017bcaf641becdd73a9d86770f7a102ccef71c
// //username: admin; password: $2a$10$gMMU.jP62zrIkGsqdLjms.swgStphpT5F5hFyGY8i5aFGA/7pKUqC

// const util = require('util');
// const queryAsync = util.promisify(connection.query).bind(connection);

// export async function fetchElectionData() {
//   try {
//     const query = "SELECT election_id, election_title, election_description FROM Election";
//     const results = await queryAsync(query);
//     const serializedData = JSON.parse(JSON.stringify(results));
//     return serializedData;
//   } catch (err) {
//     console.error('Error executing MySQL query:', err);
//     throw err;
//   }
// }
