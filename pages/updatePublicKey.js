import { useRef, useState } from "react";
import { useRouter } from 'next/router'
import axios from "axios";
import PrimaryNavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar'
import { withSession } from "../lib/session";
import { Button, Form } from "react-bootstrap"

import { useEffect } from "react";
import { fetchAdminId } from "./api/admin/query/shamirSecretSharing";

export const getServerSideProps = withSession(async ({ req }) => {
  try{  
    const isAuthenticated = req.session.get('userid');
    const isAdmin = req.session.get('isAdmin');
    const adminData = await fetchAdminId(isAuthenticated)
    const adminId = adminData.admin_id;

    if (!isAuthenticated || !isAdmin) {
      return {
        redirect: { 
          destination: '/',
          permanent: false,
        },
      }
    }
    
    return {
      props: { adminId },
    };
  } catch(error) {
    console.error('Error checking authentication:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}); 

export default function newPublicKey({adminId}) {
  const formRef = useRef();
  const router = useRouter();

  async function updatePublicKey() {
    const {
      updatePublicKey
    } = formRef.current;

    const public_key = updatePublicKey.value
    
    try {
      await axios.post("/api/admin/insert/updateAdminPublicKey", {
        admin_id: adminId,
        public_key: public_key
      });

      alert("Public Key Updated! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
          // If the API returns an error response with a status code
          const errorMessage = error.response.data.err;
          alert(`Error: ${errorMessage}`);
      } else {
          // If the request fails entirely (network error, etc.)
          console.error(error);
          alert("An error occurred while updating the public key.");
      }
    }
  }

  return (
    <div>
      <PrimaryNavBar />
      <SecondaryNavBar />
      <div style={{ padding: '2%'}}>
        <Form ref={ formRef }>
          <Form.Group className="mb-3">
            <Form.Label>Public Key</Form.Label>
            <Form.Control as="textarea" cols={10} rows={6} name="updatePublicKey" placeholder="Enter new public key" />
          </Form.Group>

          <Button variant="outline-dark" onClick={() => updatePublicKey()}>Update</Button>
        </Form>
      </div>
    </div>
  )
}
