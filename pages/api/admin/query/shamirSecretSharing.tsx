import prisma from "../../../../lib/prisma";

export async function fetchAdminId(userId) {
  try {
    // Use Prisma Client to fetch ballot data
    const adminData = await prisma.admin.findFirst({
      where: {
        user_id: parseInt(userId)
      },
      select: {
        admin_id: true,
        public_key: true,
        privilege: true,
      },
    });

    return adminData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

export async function fetchShareDataByAdminId(election_id, adminId) {
  try {
    const shareData = await prisma.share.findFirst({
      where: {
        election_id: parseInt(election_id),
        admin_id: adminId,
      },
      select: {
        encrypted_ss: true,
      },
    });

    return shareData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

export async function fetchPublicKey() {
  try {
    const adminData = await prisma.admin.findMany({
      select: {
        admin_id: true,
        public_key: true,
      },
    });

    return adminData;
  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}