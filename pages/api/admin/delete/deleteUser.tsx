// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
        user_id,
        active,
    } = req.body;
    try {
      const deleteUser = await prisma.user.update({
        where: {
          user_id: parseInt(user_id),
        },
        data: {
          active,
        },
      });
      res.status(200).json(deleteUser);
    } catch (error) {
      res.status(403).json({ err: "Invalid data." });
    }
  }; 