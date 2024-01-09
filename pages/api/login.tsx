import prisma from "../../lib/prisma";
import { withSession } from '../../lib/session';

export default withSession(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { username, password } = req.body;
  console.log("login.tsx(line 11):",username);
  const bcrypt = require('bcrypt');
  try {
    // Find the user by the inputted username
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password with the hashed password stored in the database
    const result = await new Promise((resolve, reject) => {
      bcrypt.compare(password, user.hash, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    // Username and password match
    if (result) {
      console.log('Passwords match!');
      console.log("login.tsx(line 43) firstHashcheck!:");
      const userIsAdmin = await prisma.admin.findFirst({
        where: {
          user_id: user.user_id,
          privilege: true,
        },
      })
      // Get voter data that match the user_id and haven't voted yet
      const userHasBusiness = await prisma.voter.findFirst({
        where: {
          user_id: user.user_id,
          vote_status: false,
          Election: {
            status: "ONGOING",
          },
        },
      })
      // If user doesn't have a vote to do and not an admin, return forbidden response
      if (!userHasBusiness && !userIsAdmin) {
        return res.status(403).json({noBusiness: "User has no business here"});
      }
  
      // Successful login
      //req.session.set('userid', user.user_id);
      console.log("login.tsx(line 62) successful login check!:");
      if (userIsAdmin) {
        req.session.set('userid', user.user_id);
        req.session.set('userName', user.name);
        req.session.set('isAdmin', true);
        await req.session.save();
        return res.status(200).json({
          success: true,
          isAdmin: true,
        });
      } else {
          console.log("login.tsx(line 73) successful user check!:");
          req.session.set('userid', user.user_id);
          req.session.set('userName', user.name);
          req.session.set('isAdmin', false);
          await req.session.save();
          return res.status(200).json({ success: true});
      }
  
    } else {
      console.log('Passwords do not match.');
      return res.status(401).json({ error: "Invalid credentials" });
    }

  } catch (error) {
    // Handle other errors, if any
    console.error("Error occurred while processing login:", error);
    return res.status(500).json({ error: "Error querying data" });
  } finally {
    await prisma.$disconnect();
  }
})
