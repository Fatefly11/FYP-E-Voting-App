import prisma from "../../../../lib/prisma";

// 1. Display values in the form

export async function fetchUserById(userId) {
  try {
    // Use Prisma Client to fetch candidate data
    const result = await prisma.user.findUnique({
      where: {
        user_id: parseInt(userId)
      },
      select: {
        username: true,
        name: true,
        hash: true,
        email: true,
      },
    });

    return result;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
} 

  export async function fetchUserIsAdmin(userId) {
    try {
      // Use Prisma Client to fetch candidate data
      const result = await prisma.admin.findUnique({
        where: {
          user_id: parseInt(userId)
        },
        select: {
          privilege: true,
        },
      });
  
      return result;
    } catch (err) {
      console.error("Error executing Prisma query:", err);
      throw err;
    }
  } 
