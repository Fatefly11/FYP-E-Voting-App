import Link from 'next/link';
import NavBar from '../components/PrimaryNavBar'
import SecondaryNavBar from '../components/SecondaryNavBar';
import { useRouter } from 'next/router';
import { Container, Navbar, Table, Button } from "react-bootstrap";
import { fetchUserData } from "./api/admin/query/accountsManagement";
import { withSession } from "../lib/session";
import axios from "axios";

import { useEffect, useState } from "react";

export const getServerSideProps = withSession(async ({ req }) => {
  const userList = await fetchUserData();

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

    return {
      props: { userList },
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
const TableComponent = ({ userData }) => {
  const userList = userData ? userData.userList : [];

  //lala
  const [adminUsername, setUsername] = useState(null);

  useEffect(() => {
    // Perform localStorage action
    const adminUsername = sessionStorage.getItem('username');
    setUsername(adminUsername);
  }, [])
  //haha

  async function deleteUser(userId) {
    try {
      if (confirm("Confirm to delete this user?")) {
        await axios.post("/api/admin/delete/deleteUser", {
          user_id: userId,
          active: false,
        });

        //lala
        await axios.post("/api/admin/insert/createActivity", {
          username: adminUsername,
          activity_description: "Delete User",
          logs_data: "User id: " + userId.toString(),
        });
        //haha

        window.location.reload();
      }
    } catch (error) {
      if (error.response) {
        // If the API returns an error response with a status code
        const errorMessage = error.response.data.err;
        alert(`Error: ${errorMessage}`);
      } else {
        // If the request fails entirely (network error, etc.)
        console.error(error);
        alert("An error occurred while deleting the user.");
      }
    };
  }

  return (
    <Container>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((item) => {
            return (
              <tr key={item.user_id}>
                <td>{item.user_id}</td>
                <td>{item.username}</td>
                <td>
                  <Link href={`/updateUsers/${item.user_id}`}>
                    <Button variant="primary">Edit User</Button>
                  </Link>
                </td>
                <td>
                  <Button variant="danger" onClick={() => deleteUser(item.user_id)}>Delete User</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

const AdminPage = (userList, userName) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('./api/logout');
      if (response.ok) {
        sessionStorage.removeItem('username');
        router.push('/');
      } else {
        console.error("Logout failed??");
      }
    } catch (error) {
      console.log("Error handling Logout: ", error)
    }
  };

  return (
    <div>
      <NavBar />
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Container>
          <Link href="/createUser">
            <Button variant="outline-dark">Create User</Button>
          </Link>
          <Link href="posts/activityLog">
            <Button variant="outline-dark">View Activity Logs</Button>
          </Link>
          <Link href="/adminDashboard">
            <Button variant="outline-dark">Admin Dashboard</Button>
          </Link>
          <Button variant="outline-dark" onClick={handleLogout}>Logout</Button>
        </Container>
      </Navbar>
      <TableComponent userData={userList} />
    </div>
  );
};

export default AdminPage;