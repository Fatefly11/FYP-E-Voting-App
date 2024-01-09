import Link from "next/link";
import { useState } from "react";
import { Container, Nav, Button, Navbar, Stack } from "react-bootstrap";
import PrimaryNavBar from "./PrimaryNavBar";
import { useRouter } from "next/router";


// const BurgerNavbar = () => {
//     const [navbarOpen, setNavbarOpen] = useState(false);

//     const toggleNavbar = () => {
//         setNavbarOpen(!navbarOpen);
//     };

//     return (
//         <Navbar bg="dark" variant="dark" expand="lg">
//             <Navbar.Brand href="/">Logo</Navbar.Brand>
//             <Navbar.Toggle onClick={toggleNavbar} aria-controls="responsive-navbar-nav" />
//             <Navbar.Collapse id="responsive-navbar-nav" className={navbarOpen ? 'show' : ''}>
//                 <Nav className="mr-auto">
//                     <Link href="/createElection">
//                         <Nav.Link>Create Election</Nav.Link>
//                     </Link>
//                     <Link href="posts/useCase15">
//                         <Nav.Link>View Activity Logs</Nav.Link>
//                     </Link>
//                     <Link href="/accountsManagement">
//                         <Nav.Link>Account Management</Nav.Link>
//                     </Link>
//                 </Nav>

//             </Navbar.Collapse>
//         </Navbar>
//     );
// };
// export default BurgerNavbar;

function SideNavExample() {
    const [sideNavCollapsed, setSideNavCollapsed] = useState(true);

    const toggleSideNav = () => {
        setSideNavCollapsed(!sideNavCollapsed);
    };

    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('../api/logout');
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

    return (
        <Navbar sticky="top" className="navbar-expand-lg" >


            <Container className="w-100vw" >

                <Nav className="flex-column p-3 sticky-top bg-light w-100 rounded-3">
                    <Stack direction="horizontal">
                        <Link href="/createElection">

                            <Button variant="outline-dark">Create Election</Button>
                        </Link>
                        <Link href="/posts/useCase15">
                            <Button variant="outline-dark">View Activity Logs</Button>
                        </Link>
                        <Link href="/accountsManagement">
                            <Button variant="outline-dark">Account Management</Button>
                        </Link>
                        <div className="fluid align-right ms-auto">

                            <Stack direction="horizontal">
                                <Nav.Link style={navLinkStyle} onClick={() => router.back()}>
                                    <Button variant="outline-dark">Back</Button>
                                </Nav.Link>
                                <Link style={navLinkStyle} href="/adminDashboard">
                                    <Button variant="outline-dark">Home</Button>
                                </Link>
                                <Button variant="outline-dark" onClick={handleLogout}>Logout</Button>

                            </Stack>
                        </div>
                    </Stack>

                    {/* <Button variant="outline-dark" onClick={toggleSideNav}>
                    ...
                </Button> */}
                </Nav>
            </Container>
        </Navbar>
    );
}

export default SideNavExample;

