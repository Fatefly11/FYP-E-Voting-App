import { useRef } from "react"
import { useRouter } from 'next/router'
import axios from "axios"
import PrimaryNavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar'
import { withSession } from "../lib/session";
import { Button, Form, Container } from "react-bootstrap"

import { useEffect, useState } from "react";
import prisma from '../lib/prisma'

export const getServerSideProps = withSession(async ({ req }) => {
  try {
    const isAuthenticated = req.session.get('userid');
    const isAdmin = req.session.get('isAdmin');
    console.log(isAuthenticated, isAdmin)
    if (!isAuthenticated || !isAdmin) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    var ballottt = await prisma.ballot.findMany({})
    ballottt = JSON.parse(JSON.stringify(ballottt))
    console.log(ballottt)
    return {
      props: { ballottt },
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
});

export default function AddBallot({ ballottt }) {

  const formRef = useRef();
  const router = useRouter();
  const { param } = router.query;
  const electionId = parseInt(param);

  //lala
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const username = sessionStorage.getItem('username');
    setUsername(username);
  }, [])
  var daLength = 0
  console.log("username is: ", username)
  console.log("typeof username is: ", typeof username)
  //haha

  async function addNewBallot(electionId) {
    const {
      addBallotTitle,
      addBallotDescription
    } = formRef.current;

    const ballot_title = addBallotTitle.value;
    const ballot_description = addBallotDescription.value;
    try {
      await axios.post("/api/admin/insert/createBallot", {
        election_id: electionId,
        ballot_title,
        ballot_description,
      });

      //lalala
      daLength = ballottt[ballottt.length - 1].ballot_id++
      console.log("daLength is: ", daLength)
      console.log("_____in func_____")
      var daLengthPlus1 = ++daLength

      await axios.post("/api/admin/insert/createActivity", {
        username: username,
        activity_description: "Create Ballot",
        logs_data: "Ballot id: " + daLengthPlus1.toString(),
      });
      //haha

      alert("Ballot Created! Redirecting back to previous page...")

      router.back()
    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while creating the ballot.");
      }
    }
  }

  return (
    <div>
      <PrimaryNavBar />
      <SecondaryNavBar />
      <div>
        <Container>

          <Form ref={formRef}>
            <Form.Group className="mb-3">
              <Form.Label>Ballot Title:</Form.Label>
              <Form.Control type="text" name="addBallotTitle" placeholder="Enter name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ballot Description: </Form.Label>
              <Form.Control as="textarea" rows={4} cols={50} name="addBallotDescription" placeholder="Enter description" />
            </Form.Group>
          </Form>
          <Button variant="Secondary" onClick={() => addNewBallot(electionId)}>Save</Button>
        </Container>

      </div>
    </div>
  )
}