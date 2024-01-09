'use client';
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/page.module.css";
import NavBar from '../components/PrimaryNavBarVoter'
import axios from "axios";
import SEAL from 'node-seal'
import {
  Container,
  Navbar,
  Table,
  Button,
  Modal,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import { fetchElectionData } from "./api/voter/voterElectionData";
import { withSession } from "../lib/session";

import createData from "./api/createVoteData";

export const getServerSideProps = withSession(async ({ req }) => {

  try {
    const isAuthenticated = req.session.get('userid');

    //console.log('session UserID test:',isAuthenticated);

    if (!isAuthenticated) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    const electionList = await fetchElectionData(isAuthenticated);

    return {
      props: { electionList },
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

export function clickVote(candidateList, id: number) {
  let x = createData(candidateList, id);
  return x[1]
  // window.alert(x[1]);
}

function TableComponent({ electionData }) {
  const electionList = electionData ? electionData.electionList : [];

  return (
    <Container style={{ height: "100vh", paddingTop: "3vh" }}>
      <h2>List of available election</h2>
      <hr className="col-6 col-md-4 mb-5" />
      <div className="table-responsive">
        <table className="table table-hover align-middle fs-5" >
          <thead>
            <tr>
              <th className="ps-3" scope="col">ID</th>
              <th scope="col">Election</th>
              <th scope="col"></th>

            </tr>
          </thead>
          <tbody>
            {electionList.map((item) => (
              <tr key={item.election_id}>
                <td className="ps-3">{item.election_id}</td>
                <td>{item.election_title}</td>
                <td className="text-end px-3">
                  <ElectionDescModal
                    electionID={item.election_id}
                    electionTitle={item.election_title}
                    electionDesc={item.election_description}
                    ballotData={item.Ballot}
                    electionPublicKey={item.public_key}
                  />
                </td>
              </tr>
            ))}


          </tbody>
        </table>
      </div>

    </Container>
  );
}

function ElectionDescModal({ electionTitle, electionDesc, ballotData, electionPublicKey, electionID }) {
  const [show, setShow] = useState(false);
  //console.log(electionPublicKey)
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const candidateData = ballotData ? ballotData[0] : ["No ballot"];
  //console.log(candidateData);
  console.log("nextpage.tsx(Line 103) electionID test 2:", electionID);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        View More
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{electionTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{electionDesc}</Modal.Body>
        <Modal.Footer>
          <VotingModal candidateData={candidateData} publicKey={electionPublicKey} ballotId={ballotData.ballot_id} election_ID={electionID} />
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function VotingModal({ candidateData, publicKey, ballotId, election_ID }) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  console.log("nextpage.tsx(Line 132) electionID test 3:", election_ID);

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

  async function encryptAndStoreVote(candidateData, candidate_id, publicKey, ballotId, electionID) {
    //console.log(ballotId)
    const voteData = clickVote(candidateData, candidate_id)
    // console.log(publicKey)
    const seal = await SEAL()
    console.log("nextpage.tsx(Line 138) electionID test 4:", electionID);

    ////////////////////////
    // Encryption Parameters
    ////////////////////////

    // Create a new EncryptionParameters
    const schemeType = seal.SchemeType.bfv
    const securityLevel = seal.SecurityLevel.tc128
    const polyModulusDegree = 4096
    const bitSizes = [36, 36, 37]
    const bitSize = 20

    const encParms = seal.EncryptionParameters(schemeType)

    // Assign Poly Modulus Degree
    encParms.setPolyModulusDegree(polyModulusDegree)

    // Create a suitable set of CoeffModulus primes
    encParms.setCoeffModulus(
      seal.CoeffModulus.Create(
        polyModulusDegree,
        Int32Array.from(bitSizes)
      )
    )

    // Assign a PlainModulus (only for bfv/bgv scheme type)
    encParms.setPlainModulus(seal.PlainModulus.Batching(polyModulusDegree, bitSize))

    ////////////////////////
    // Context
    ////////////////////////

    // Create a new Context
    const context = seal.Context(
      encParms,
      true,
      securityLevel
    )



    // Helper to check if the Context was created successfully
    if (!context.parametersSet()) {
      throw new Error('Could not set the parameters in the given context. Please try different encryption parameters.')
    }

    ////////////////////////
    // Keys
    ////////////////////////
    //console.log(publicKey)

    const loadedPublicKey = seal.PublicKey()
    loadedPublicKey.load(context, publicKey)

    // const loadedPublicKey= keyGenerator.createPublicKey().load(context,publicKeyString)

    // // Create the PlainText(s) 
    const plaintext = seal.PlainText()

    // // Create the CipherText(s) 
    const ciphertext = seal.CipherText()

    // // Create a BatchEncoder (only bfv/bgv SchemeType)
    const batchEncoder = seal.BatchEncoder(context)

    //  // Create an Encryptor
    const encryptor = seal.Encryptor(
      context,
      loadedPublicKey
    )

    //console.log(voteData)
    //   // Encode data to a PlainText
    batchEncoder.encode(
      Int32Array.from(voteData),
      plaintext
    )

    //   // Encrypt a PlainText
    encryptor.encrypt(
      plaintext,
      ciphertext
    )

    // console.log(ciphertext.save())
    await axios.post("/api/voter/insertVoteData", {
      ballot_id: ballotId,
      vote_data: ciphertext.save(),
    });

    await axios.post("/api/voter/updateVoter", {
      election_id: electionID,
    }).then(response => {
      const voterToken = response.data;
      alert(`Vote has been casted!\n Your token is ${voterToken}\nPlease write it down for your own vote verification purposes \n\n You will be logged out for authentication purposes.`);
    })
    handleLogout();
    return

  }


  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Start Voting
      </Button>

      <Modal
        size="xl"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{candidateData.ballot_title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row className="justify-content-center">
              {candidateData.Candidate.map((item) => (
                <Col key={item.candidate_id} xs={12} sm={9} md={6} lg={3} className="mb-4 d-flex justify-content-center">
                  <Card className="mx-auto mb-4" style={{ width: "250px" }}>
                    {item.picture ? (
                      <div className="card-img-top" style={{ width: "100%", paddingTop: "100%", background: `url(${item.picture}) no-repeat center center / cover` }}></div>
                    ) : (
                      <div className="card-img-top" style={{ width: "100%", paddingTop: "100%", background: `url(/images/default-empty.png) no-repeat center center / cover` }}></div>
                    )}
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>{item.description}</Card.Text>
                      <Button
                        variant="primary"
                        onClick={() =>
                          encryptAndStoreVote(
                            candidateData,
                            item.candidate_id,
                            publicKey,
                            candidateData.ballot_id,
                            election_ID
                          )
                        }
                      >
                        Vote!
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>

    </>
  );
}

const NextPage = (electionList) => {
  const username = electionList ? electionList.userName : [];
  const router = useRouter();
  const setUsername = '';

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
        <Container className="d-flex justify-content-end w-100">
          <Button variant="light" onClick={handleLogout}>Logout</Button>
        </Container>
      </Navbar>
      <div>
        <TableComponent electionData={electionList} />
      </div>
    </div>
  );
};

export default NextPage;
