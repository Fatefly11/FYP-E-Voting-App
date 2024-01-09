import { useRef } from "react"
import { useRouter } from 'next/router'
import axios from "axios"
import PrimaryNavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar'
import { withSession } from "../lib/session";
import { Button, Container, Form } from "react-bootstrap"

import { useEffect, useState } from "react";
import prisma from '../lib/prisma'


export const getServerSideProps = withSession(async ({ req }) => {
  try {
    const isAuthenticated = req.session.get('userid');
    const isAdmin = req.session.get('isAdmin');

    if (!isAuthenticated || !isAdmin) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    var candidateee = await prisma.candidate.findMany({})
    candidateee = JSON.parse(JSON.stringify(candidateee))

    return {
      props: { isAuthenticated, candidateee },
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

export default function AddCandidate({ isAuthenticated, candidateee }) {

  const formRef = useRef();
  const router = useRouter();
  const { param } = router.query;
  const ballotId = parseInt(param);

  //lala
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const username = sessionStorage.getItem('username');
    setUsername(username);
  }, [])
  var daLength = 0
  console.log("candidateee.length - 1 is: ", candidateee.length - 1)
  console.log("typeof username is: ", typeof username)
  //haha

  async function addNewCandidate(ballotId) {
    const {
      addCandidateName,
      addCandidateDescription,
      addCandidateBio,
      addCandidatePicture,
    } = formRef.current;

    const name = addCandidateName.value;
    const description = addCandidateDescription.value;
    const bio = addCandidateBio.value;
    const picture = addCandidatePicture.value;
    try {
      await axios.post("/api/admin/insert/createCandidate", {
        ballot_id: ballotId,
        name,
        description,
        bio,
        picture,
      });

      //lalala
      daLength = candidateee[candidateee.length - 1].candidate_id++
      console.log("daLength is: ", daLength)
      console.log("_____in func_____")
      var daLengthPlus1 = ++daLength

      await axios.post("/api/admin/insert/createActivity", {
        username: username,
        activity_description: "Add Candidate",
        logs_data: "Candidate id: " + daLengthPlus1.toString()
          + ", added to ballot id: " + ballotId.toString(),
      });
      //haha

      alert("Candidate Created! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while creating the candidate.");
      }
    }
  }

  return (
    <div>
      <PrimaryNavBar sessionData={isAuthenticated} />
      <SecondaryNavBar />
      <div>
        <Container>
          <Form ref={formRef}>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Name:</Form.Label>
              <Form.Control type="text" name="addCandidateName" placeholder="Enter name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Description: </Form.Label>
              <Form.Control as="textarea" rows={4} cols={50} name="addCandidateDescription" placeholder="Enter description" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Bio: </Form.Label>
              <Form.Control as="textarea" rows={4} cols={50} name="addCandidateBio" placeholder="Enter bio" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Picture:</Form.Label>
              <Form.Control type="text" name="addCandidatePicture" placeholder="Insert URL" />
            </Form.Group>
          </Form>
          <Button variant="Secondary" onClick={() => addNewCandidate(ballotId)}>Save</Button>
        </Container >

      </div>
    </div>
  )
}