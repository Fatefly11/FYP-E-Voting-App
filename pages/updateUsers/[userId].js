import { useRouter } from "next/router";
import { useRef, useState } from "react"
import { FormCheck, Form, Button } from "react-bootstrap"
import { fetchUserById, fetchUserIsAdmin } from "../api/admin/query/UserById"
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import axios from "axios";
import { withSession } from "../../lib/session";

import { useEffect } from "react";

export const getServerSideProps = withSession(async (context) => {
  const id = context.params.userId;

  const userDataById = await fetchUserById(id)
  const userIsAdmin = await fetchUserIsAdmin(id)

  try {
    const isAuthenticated = context.req.session.get("userid");
    const isAdmin = context.req.session.get("isAdmin");
    if (isAuthenticated == undefined || isAdmin == false) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    return {
      props: { userDataById, userIsAdmin },
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

export default function Page({ userDataById, userIsAdmin }) {
  const router = useRouter()

  const userId = router.query.userId
  const formRef = useRef();

  const [isAddAdminChecked, setIsAddAdminChecked] = useState(false);
  const [isRemoveAdminChecked, setIsRemoveAdminChecked] = useState(false);
  const [isGiveAdminChecked, setIsGiveAdminChecked] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  //lala
  const [adminUsername, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const adminUsername = sessionStorage.getItem('username');
    setUsername(adminUsername);
  }, [])
  //haha

  async function updateUserAndAddAdmin(userId) {
    const {
      updatePassword,
      updateEmail,
    } = formRef.current;

    const hash = updatePassword.value;
    const email = updateEmail.value;

    try {
      await axios.post("/api/admin/insert/updateUser", {
        user_id: userId,
        hash,
        email,
      });

      await axios.post("/api/admin/insert/createAdmin", {
        user_id: parseInt(userId),
      });

      //lala
      await axios.post("/api/admin/insert/createActivity", {
        username: adminUsername,
        activity_description: "Update User",
        logs_data: "User id: " + userId.toString(),
      });
      //haha

      alert("User Updated! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while updating the user.");
      }
    }
  }

  async function updateUserAndGiveAdmin(userId) {
    const {
      updatePassword,
      updateEmail,
    } = formRef.current;

    const hash = updatePassword.value;
    const email = updateEmail.value;

    try {
      await axios.post("/api/admin/insert/updateUser", {
        user_id: userId,
        hash,
        email,
      });

      await axios.post("/api/admin/insert/updateAdmin", {
        user_id: parseInt(userId),
        privilege: true,
      });

      //lala
      await axios.post("/api/admin/insert/createActivity", {
        username: adminUsername,
        activity_description: "Update User",
        logs_data: "User id: " + userId.toString(),
      });
      //haha

      alert("User Updated! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while updating the user.");
      }
    }
  }

  async function updateUserAndRemoveAdmin(userId) {
    const {
      updatePassword,
      updateEmail,
    } = formRef.current;

    const hash = updatePassword.value;
    const email = updateEmail.value;

    try {
      await axios.post("/api/admin/insert/updateUser", {
        user_id: userId,
        hash,
        email,
      });

      await axios.post("/api/admin/insert/updateAdmin", {
        user_id: parseInt(userId),
        privilege: false,
      });

      //lala
      await axios.post("/api/admin/insert/createActivity", {
        username: adminUsername,
        activity_description: "Update User",
        logs_data: "User id: " + userId.toString(),
      });
      //haha

      alert("User Updated! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while updating the user.");
      }
    }
  }

  async function updateUser(userId) {
    const {
      updatePassword,
      updateEmail,
    } = formRef.current;

    const hash = updatePassword.value;
    const email = updateEmail.value;

    try {
      await axios.post("/api/admin/insert/updateUser", {
        user_id: userId,
        hash,
        email,
      });

      //lala
      await axios.post("/api/admin/insert/createActivity", {
        username: adminUsername,
        activity_description: "Update User",
        logs_data: "User id: " + userId.toString(),
      });
      //haha

      alert("User Updated! Redirecting back to previous page...")

      router.back()

    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while updating the user.");
      }
    }
  }

  async function togglePasswordField() {
    if (confirm("Are you sure you want to update password?")) {
      setShowPasswordField(true);
      setIsButtonDisabled(true);
      setTimeout(() => {
        const inputField = document.getElementById('passwordField');
        if (inputField) {
          inputField.value = '';
        }
        const defaultPasswordField = document.getElementById('defaultPassword');
        if (defaultPasswordField) {
          defaultPasswordField.remove();
        }
      }, 0);
    }

  }
  return (
    <>
      <div>
        <PrimaryNavBar />
        <SecondaryNavBar />
        <div style={{ padding: '2%' }}>
          <h2 style={{ textAlign: "center", }}>User {userId}</h2>
          <Form ref={formRef}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="updateUsername" defaultValue={userDataById.username} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="updateName" defaultValue={userDataById.name} disabled />
              <Form.Control id="defaultPassword" type="hidden" name="updatePassword" defaultValue={userDataById.hash} />
            </Form.Group>
            <Button variant="outline-primary" onClick={() => togglePasswordField()} disabled={isButtonDisabled}>Update Password</Button>
            {(showPasswordField) && (
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control id="passwordField" type="text" name="updatePassword" placeholder="Please enter a new password" defaultValue={userDataById.hash} />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" name="updateEmail" defaultValue={userDataById.email} />
            </Form.Group>
            {(userIsAdmin == null) && (
              <Form.Group className="mb-3">
                <FormCheck
                  type="checkbox"
                  label="Give this user admin privileges"
                  onChange={() => setIsAddAdminChecked(!isAddAdminChecked)}
                />
              </Form.Group>
            )}
            {(userIsAdmin != null && userIsAdmin.privilege == true) && (
              <Form.Group className="mb-3">
                <FormCheck
                  type="checkbox"
                  label="Remove this user admin privileges"
                  onChange={() => setIsRemoveAdminChecked(!isRemoveAdminChecked)}
                />
              </Form.Group>
            )}
            {(userIsAdmin != null && userIsAdmin.privilege == false) && (
              <Form.Group className="mb-3">
                <FormCheck
                  type="checkbox"
                  label="Give this user admin privileges"
                  onChange={() => setIsGiveAdminChecked(!isGiveAdminChecked)}
                />
              </Form.Group>
            )}
            <Button variant="outline-dark"
              onClick={() => {
                if (isAddAdminChecked) {
                  updateUserAndAddAdmin(userId);
                } else if (isRemoveAdminChecked) {
                  updateUserAndRemoveAdmin(userId);
                } else if (isGiveAdminChecked) {
                  updateUserAndGiveAdmin(userId);
                } else
                  updateUser(userId);
              }}>Save User</Button>
          </Form>
        </div>
      </div>
    </>
  )
}