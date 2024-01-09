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
                    <Dropdown data-bs-theme="gray-dark">
                        <Dropdown.Toggle id="dropdown-button-dark-example1" variant="dark" className="text-white text-truncate">
                            <span className="d-inline-block" style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                Hello, <a className="ps-1 d-inline-block ">{username}</a>
                            </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu >
                            <Dropdown.Item href="/updatePublicKey" className="text-white">
                                Update My Public Key
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleLogout()} className="text-white">Logout</Dropdown.Item>

                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Collapse>
            </Container >
        </Navbar >
    )
}

export default PrimaryNavBar;


