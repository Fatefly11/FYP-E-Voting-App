import { useEffect, useState } from "react";
import { Container, Dropdown, NavDropdown, Navbar } from "react-bootstrap";
import { useRouter } from 'next/router';
const PrimaryNavBar = () => {

    const [username, setUsername] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Perform localStorage action
        const username = sessionStorage.getItem('username');
        setUsername(username);
    }, [])

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
        <Navbar bg="dark" data-bs-theme="dark" style={{ zIndex: 1050 }}>
            < Container >
                <Navbar.Brand >NextSeal E-Voting</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">

                    <Navbar.Text className="me-1">
                        Signed in as: <a >{username}</a>
                    </Navbar.Text>

                </Navbar.Collapse>
            </Container >
        </Navbar >
    )
}

export default PrimaryNavBar;


