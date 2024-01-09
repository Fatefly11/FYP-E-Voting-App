import prisma from "../../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export const config = {
  api: {
    externalResolver: true,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST"){
        try {
          const data = req.body

          console.log("body is ", data)

          const parsedData = JSON.parse(data)
          console.log(parsedData)
          
          const addList = await prisma.voter.createMany({
            data: parsedData
          })
        }catch(err){
          res.json(err);
          console.error("Error executing Prisma query:", err);
          res.status(405).end();
          throw err;
        }
        return res.status(200).json("success")
    }else{
      return res.status(405).json({message:"method not allowed"})
    }
    //res.status(200).json({ name: 'John Doe' })
}

// 3. insert selection list
// INSERT INTO Voter (user_id, election_id) VALUES (13, 1);
