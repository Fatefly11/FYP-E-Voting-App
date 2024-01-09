import { useRef, useState } from "react";
import { useRouter } from 'next/router'
import axios from "axios";
import PrimaryNavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar'
import { withSession } from "../lib/session";
import { Button, Form, Container } from "react-bootstrap"

import { useEffect } from "react";
import prisma from "../lib/prisma";

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

    var userrr = await prisma.user.findMany({})
    userrr = JSON.parse(JSON.stringify(userrr))

    return {
      props: { userrr },
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

export default function AddUser({ userrr }) {
  const formRef = useRef();
  const router = useRouter();

  //lala
  const [adminUsername, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const adminUsername = sessionStorage.getItem('username');
    setUsername(adminUsername);
  }, [])
  var daLength = 0
  //haha

  async function addNewUser() {
    const {
      addUsername,
      addName,
      addPassword,
      addEmail,
    } = formRef.current;

    const username = addUsername.value;
    const name = addName.value;
    const hash = addPassword.value;
    const email = addEmail.value;

    try {
      await axios.post("/api/admin/insert/createUser", {
        username,
        name,
        hash,
        email,
      });

      //lala
      await axios.post("/api/admin/insert/createActivity", {
        username: adminUsername,
        activity_description: "Create User",
        logs_data: "User id: " + (userrr[userrr.length - 1].user_id + 1).toString(),
      });
      //haha

      alert("User Created! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while creating the user.");
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
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="addUsername" placeholder="Enter username" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="addName" placeholder="Enter name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="text" name="addPassword" placeholder="Enter password" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="text" name="addEmail" placeholder="Enter email" />
          </Form.Group>
          <Button variant="outline-dark" onClick={() => addNewUser()}>Save User</Button>
        </Form>
      </Container>
    </div>
  )
}
