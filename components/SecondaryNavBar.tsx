import Nav from 'react-bootstrap/Nav';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container, Navbar, Button, Stack } from "react-bootstrap";

const SecondaryNavBar = () => {
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

  const navLinkStyle = {
    color: 'black', // Customize link color
    textDecoration: 'none', // Remove underline
    marginRight: '15px' // Adjust spacing
  };

  const buttonStyle = {
    backgroundColor: 'transparent', // Transparent background
    color: 'black', // Customize text color
    border: 'none', // Remove border
    cursor: 'pointer' // Show pointer cursor on hover
  };

  return (
    <Navbar sticky="top" expand="md" className="bg-light" >
      <Container>

        <Container className="w-100vw" >

          <Nav className="flex-column p-3 sticky-top  w-100 rounded-3"  >
            <Stack direction="horizontal" gap={1}>
              <Link href="/createElection">

                <Button variant="outline-dark text-nowrap">Add Election</Button>
              </Link>
              <Link href="/posts/activityLog">
                <Button variant="outline-dark text-nowrap">Activity Logs</Button>
              </Link>
              <Link href="/accountsManagement">
                <Button variant="outline-dark text-nowrap">Accounts</Button>
              </Link>
              {/* <Link href="/updatePublicKey">
              <Button variant="outline-dark text-nowrap">Update My Public Key</Button>
            </Link> */}






              <div className='ms-auto'><Navbar.Toggle aria-controls="basic-navbar-nav w-25" /></div>
            </Stack>
            {/* <Button variant="outline-dark" onClick={toggleSideNav}>
                    ...
                  </Button> */}
          </Nav>
        </Container>
        <Container className='px-4'>
          <Navbar.Collapse id="basic-navbar-nav nav justify-content-end">
            <Nav className="ms-auto">
              <Button variant="outline-dark ms-1 mt-2" onClick={() => router.back()}>Back</Button>
              <Button variant="outline-dark ms-1 mt-2" href="/adminDashboard">Home</Button>
              {/* <Button variant="outline-dark ms-1 mt-2" onClick={handleLogout}>Logout</Button> */}
            </Nav>
          </Navbar.Collapse>
        </Container>

      </Container>
    </Navbar >
  )
}

export default SecondaryNavBar;