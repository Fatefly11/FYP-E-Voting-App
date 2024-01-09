import prisma from "../../../../lib/prisma";

export async function fetchAdminRoll(electionId) {
  try {
    // Use Prisma Client to fetch election data
    const adminData = await prisma.admin.findMany({
      where: {
        privilege: true,
        public_key: { 
          not: null
        }
      },
      select: {
        admin_id: true,
        User: {
          select: {
            name: true
          }
        }
      },
    });

    return adminData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
