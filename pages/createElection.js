import { useRef, useState } from "react";
import { useRouter } from 'next/router'
import axios from "axios";
import PrimaryNavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar'
import { withSession } from "../lib/session";
import { Button, Container, Form } from "react-bootstrap"

import { useEffect } from "react";
import { fetchLatestElectionId } from "./api/admin/query/lastElectionId";

export const getServerSideProps = withSession(async ({ req }) => {
  try {
    const isAuthenticated = req.session.get('userid');
    const isAdmin = req.session.get('isAdmin');

    const latestElectionId = await fetchLatestElectionId();
    console.log(latestElectionId.election_id);

    if (!isAuthenticated || !isAdmin) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    return {
      props: { latestElectionId },
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

export default function AddElection({ latestElectionId }) {
  const formRef = useRef();
  const router = useRouter();

  //lala
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const username = sessionStorage.getItem('username');
    setUsername(username);
  }, [])

  async function addNewElection() {
    const {
      addElectionTitle,
      addElectionDescription,
    } = formRef.current;

    const election_title = addElectionTitle.value;
    const election_description = addElectionDescription.value;
    const status = "NO KEYPAIR";

    try {
      await axios.post("/api/admin/insert/createElection", {
        election_title,
        election_description,
        status,
      });

      await axios.post("/api/admin/insert/createActivity", {
        // admin_id: username,
        // admin_id: 3,
        username: username,
        activity_description: "Create Election",
        logs_data: "Election id: " + latestElectionId.election_id,
      });


      //haha

      alert("Election Created! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while creating the election.");
      }
    }
  }

  return (
    <div>
      <PrimaryNavBar />
      <SecondaryNavBar />
      <Container>
        <Form ref={formRef}>
          <Form.Group className="mb-3">
            <Form.Label>Election Title</Form.Label>
            <Form.Control type="text" name="addElectionTitle" placeholder="Enter title" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Election Description</Form.Label>
            <Form.Control type="text" name="addElectionDescription" placeholder="Enter description" />
          </Form.Group>
          <Button variant="outline-dark" onClick={() => addNewElection()}>Save Election</Button>
        </Form>
      </Container>
    </div>
  )
}
