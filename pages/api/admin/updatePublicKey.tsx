

import prisma from "../../../lib/prisma";
import * as fs from 'fs';

// function saveServerSide(secretKeyString, publicKeyString){
//   fs.writeFileSync('seal_private_key.txt', secretKeyString, 'utf8')
//     fs.writeFileSync('seal_public_key.txt', publicKeyString, 'utf8')
//   }

export default async (req, res) => {
    const {
        election_id,
		publickey,

    } = req.body;
    try {
      const updatePublicKey = await prisma.election.update({
        where: {
          election_id: parseInt(election_id),
        },
        data: {
          public_key: publickey,
        },
      });
      // saveServerSide(secretkey,publickey)
      console.log("Success")
      res.status(200).json(updatePublicKey);
    } catch (error) {
      res.status(403).json({ err: "Error occurred while updating the election." });
    }
  }; 