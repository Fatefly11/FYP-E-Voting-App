// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const {
      admin_id,
      public_key
    } = req.body;
    try {
      const updateAdmin = await prisma.admin.update({
        where: {
          admin_id: parseInt(admin_id),
        },
        data: {
          public_key
        },
      });
      res.status(200).json(updateAdmin);
    } catch (error) {
      res.status(403).json({ err: "Invalid data." });
    }
  }; 