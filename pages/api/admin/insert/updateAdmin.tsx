// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      user_id,
      privilege,
    } = req.body;
    try {
      const updateAdmin = await prisma.admin.update({
        where: {
          user_id: parseInt(user_id),
        },
        data: {
          user_id,
          privilege,
        },
      });
      res.status(200).json(updateAdmin);
    } catch (error) {
      res.status(403).json({ err: "Invalid data." });
    }
  }; 