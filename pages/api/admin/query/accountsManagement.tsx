import prisma from "../../../../lib/prisma";

export async function fetchUserData() {
  try {
    // Use Prisma Client to fetch election data
    const userData = await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
      },
      where: {
        active: true,
      },
      orderBy: {
        user_id: 'asc',
      }
    });

    return userData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}
