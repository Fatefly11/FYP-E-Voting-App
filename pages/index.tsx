import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/page.module.css";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import axios from "axios";
import smth from './api/endVerification'

export default function Page() {
  //Voter
  //const [username, setUsername] = useState("voter");
  //const [password, setPassword] = useState("cee3bffe766faee7bd70c65a4f017bcaf641becdd73a9d86770f7a102ccef71c");

  //Voter bcrypt login credentials
  // Username: voterBcrypt
  // Password: passwordhash

  //Admin bcrypt login credentials
  // Username: adminBcrypt
  // Password: adminpasswordhash

  //updated Voter 1 login credentials
  // Username: voter
  // Password: voter1Bcrypt

  //default login
  // const [username, setUsername] = useState("voterBcrypt");
  // const [password, setPassword] = useState("passwordhash");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationKey, setVerificationKey] = useState("");

  const router = useRouter();
  const [showLoginAlert, setLoginShowAlert] = useState(false);
  const [showBusinessAlert, setBusinessShowAlert] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleCloseModal = () => {
    setShowVerification(false);
  };

  const onChange = (event) => {
    if (event.target.id === "username") {
      setUsername(event.target.value);
    } else if (event.target.id === "password") {
      setPassword(event.target.value);
    }
  };

  const handleLogin = (event) => {

    event.preventDefault();
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        console.log("Response status:", response.status);

        return response.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("TEST SUCCESS");
          sessionStorage.setItem('username', username);
          if (data.isAdmin) {
            router.push("/adminDashboard");
          } else {
            router.push("/voterPage");
          }
        } else {
          console.log("TEST FAIL");
          console.log("data status:", data.status);
          if (data.noBusiness) {
            setBusinessShowAlert(true);
          }

          if (data.error) {
            console.log(data.error)
            setLoginShowAlert(true);
          }
        }
      });
  };

  const handleShowVerification = () => {
    setShowVerification(true);
  }

  const handleVerification = () => {
    const data = {
      verificationKey: verificationKey,
    };

    axios.post('/api/endVerification', data)
      .then((response) => {
        const electionTitle = response.data.election_title;
        if (electionTitle) {
          alert(`Your vote has been verified and validated for Election: ${electionTitle}`);
        } else {
          alert("Incorrect Verification Key!");
        }
        handleCloseModal();
      })
      .catch((error) => {
        // Handle errors if needed
        console.error('Error verifying vote:', error);
      });
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          <Button variant="primary" className={styles.code} onClick={handleShowVerification}>Verification</Button>
        </p>
      </div>
      <p style={{ paddingTop: "5vh" }}>Welcome to nextSeal e-voting system</p>
      <div className={styles.center}>
        <h1>Login</h1>
      </div>
      <div></div>
      <div style={{ zIndex: 5 }}>
        <form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={onChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={onChange}
            />
          </Form.Group>
          <Form.Group className="d-grid">
            <Button type="submit">Login</Button>
          </Form.Group>
          {/* <input id="username" type="text" placeholder="Username" value={username} onChange={onChange} />
          <input id="password" type="text" placeholder="Password" value={password} onChange={onChange} />
          <button id='subBtn' type="submit">Login</button> */}
        </form>


      </div>
      {showLoginAlert && (
        <Alert variant="danger" onClose={() => setLoginShowAlert(false)} dismissible>
          <Alert.Heading>Login Failed!</Alert.Heading>
          <p>
            Your username or password is incorrect. Please try again.
          </p>
        </Alert>
      )}
      {showBusinessAlert && (
        <Alert variant="danger" onClose={() => setBusinessShowAlert(false)} dismissible>
          <Alert.Heading>Login Denied!</Alert.Heading>
          <p>
            You do not have any ongoing elections!
          </p>
        </Alert>
      )}
      <Modal show={showVerification} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Your Vote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Verification Key:</label>
          <input
            type="text"
            value={verificationKey}
            onChange={(e) => setVerificationKey(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleVerification}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
