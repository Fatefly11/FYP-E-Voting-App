// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
//s
const prisma = new PrismaClient();

export default async (req, res) => {
  const data = req.body;
  try {
    console.log(data)
    const result = await prisma.vote.create({
      data: {
        ...data,  
      },
    });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(403).json({ err: "Error occured while adding a new candidate." });
  }
};
