import { useRouter } from "next/router";
import { useRef } from "react"
import { Table, Form, Button } from "react-bootstrap"
import { fetchElectionById } from "../api/admin/query/electionById"
import { fetchBallotByElectionId } from "../api/admin/query/ballotByElectionId"
import { fetchAdminRoll } from "../api/admin/query/adminRoll"
import { fetchAdminId, fetchShareDataByAdminId, fetchPublicKey } from "../api/admin/query/shamirSecretSharing"
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import axios from "axios";
import Link from 'next/link';
import { format } from 'date-fns'
import { withSession } from "../../lib/session";
import SEAL from 'node-seal';
import { split, join } from 'shamir';
import { randomBytes } from 'crypto';
const NodeRSA = require('node-rsa');


import { useEffect, useState } from "react";


export const getServerSideProps = withSession(async (context) => {
    const id = context.params.electionId;
    const userId = context.req.session.get("userid");
    const adminPublicKey = await fetchPublicKey()
    const electionDataById = await fetchElectionById(id)
    const adminRoll = await fetchAdminRoll()
    const ballotDataByElectionId = await fetchBallotByElectionId(id)

    let formattedStartDate = "";
    let formattedEndDate = "";

    if (electionDataById.start_date != null)
        formattedStartDate = format(electionDataById.start_date, 'yyyy-MM-dd HH:mm:ss');

    if (electionDataById.end_date != null)
        formattedEndDate = format(electionDataById.end_date, 'yyyy-MM-dd HH:mm:ss');

    const serializableData = {
        ...electionDataById,
        start_date: formattedStartDate,
        end_date: formattedEndDate
    };

    try {
        const isAuthenticated = context.req.session.get("userid");
        const isAdmin = context.req.session.get("isAdmin");
        const res = await fetchAdminId(userId)
        const adminId = res.admin_id
        const encryptedSS = await fetchShareDataByAdminId(id, adminId)
        if (isAuthenticated == undefined || isAdmin == false) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            }
        }

        return {
            props: { electionDataById: serializableData, ballotDataByElectionId, adminRoll, adminId, encryptedSS, adminPublicKey },
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

export default function Page({ electionDataById, ballotDataByElectionId, adminRoll, adminId, encryptedSS, adminPublicKey }) {
    const router = useRouter()

    const electionId = router.query.electionId
    const formRef = useRef();

    const [checked, setChecked] = useState([])
    const [keyPairsGenerated, setKeyPairsGenerated] = useState(false);

    const [showAdminRoll, setShowAdminRoll] = useState(false);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        // Perform localStorage action
        const username = sessionStorage.getItem('username');
        setUsername(username);
        if (electionDataById.status === "PENDING") {
            setKeyPairsGenerated(true)
        }
    }, [])

    async function updateElection(electionId) {
        const {
            updateElectionTitle,
            updateElectionDescription,
        } = formRef.current;

        const election_title = updateElectionTitle.value;
        const election_description = updateElectionDescription.value;

        console.log(electionId);
        try {
            await axios.post("/api/admin/insert/updateElection", {
                election_id: electionId,
                election_title,
                election_description,
            });

            await axios.post("/api/admin/insert/createActivity", {
                username: username,
                activity_description: "Update Election",
                logs_data: "Election id: " + electionId.toString(),
            });

            alert("Election Updated! Redirecting back to previous page...")

            router.back()

        } catch (error) {
            if (error.response) {
                // If the API returns an error response with a status code
                const errorMessage = error.response.data.err;
                alert(`Error: ${errorMessage}`);
            } else {
                // If the request fails entirely (network error, etc.)
                console.error(error);
                alert("An error occurred while updating the election.");
            }
        }
    }

    async function downloadSecretShare(id) {
        try {
            const privateKeyInput = window.prompt('Enter your private key:');
            const privateKey = new NodeRSA();
            privateKey.importKey(privateKeyInput, 'private');
            const decryptedSecretShare = privateKey.decrypt(encryptedSS.encrypted_ss, 'utf8');
            const filename = "secretShare_" + id + "_" + adminId + ".txt"
            const file = new File([decryptedSecretShare], filename, {
                type: 'text/plain',
            })

            function download() {
                const link = document.createElement('a')
                const url = URL.createObjectURL(file)

                link.href = url
                link.download = file.name
                document.body.appendChild(link)
                link.click()

                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }
            //   uncomment the line below to download the file
            download()
        } catch (error) {
            console.error(error);
            alert("Invalid/No private key given.");
        }
        // THis for saving the string to a txt file

    }

    const handleShowAdminRoll = () => {
        setShowAdminRoll(!showAdminRoll); // Toggle the state
    };

    async function generateKeyPairs(electionId) {
        try {
            // Add your logic here



            const seal = await SEAL()

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

            // Create a new KeyGenerator (use uploaded keys if applicable)
            const keyGenerator = seal.KeyGenerator(
                context
            )


            // create key pair
            const secretKey = keyGenerator.secretKey()
            const publicKey = keyGenerator.createPublicKey()

            //transform to base 64 string
            const publicKeyString = publicKey.save()
            const secretKeyString = secretKey.save()

            const secret = secretKeyString;

            const PARTS = checked.length;

            const QUORUM = Math.ceil(checked.length / 2);

            const utf8Encoder = new TextEncoder();
            const secretBytes = utf8Encoder.encode(secret);

            const num = {};
            for (const c of checked) {
                const adminId = c.admin_id;
                num[adminId] = c.admin_id;
            }

            const parts = split(randomBytes, PARTS, QUORUM, secretBytes);

            const numKeys = Object.keys(num);
            const partsValues = Object.values(parts);

            for (let i = 0; i < numKeys.length && i < partsValues.length; i++) {
                num[numKeys[i]] = partsValues[i];
            }

            for (const key in num) {
                if (num.hasOwnProperty(key)) {
                    num[key] = btoa(String.fromCharCode.apply(null, num[key]));
                }
            }

            const publicKeyMap = {};

            for (const publicKeyInfo of adminPublicKey) {
                const admin_id = publicKeyInfo.admin_id;
                const publicKey = publicKeyInfo.public_key;
                publicKeyMap[admin_id] = publicKey;
            }
            if (confirm("Confirm to assign these admins to the election, changes cannot be made after this")) {
                //   this to update the public key in election table
                await axios.post("../api/admin/updatePublicKey", {
                    election_id: electionId,
                    publickey: publicKeyString,
                });
                alert("Election public key stored to database")

                let index = 1;
                for (const checkedAdmin of checked) {
                    const adminId = checkedAdmin.admin_id;
                    const share = num[adminId]
                    const sharePlusNum = `${index}${share}`
                    const publicKeyString = publicKeyMap[adminId]

                    const publicKey = new NodeRSA();
                    publicKey.importKey(publicKeyString, 'public');
                    const encryptedSecretShare = publicKey.encrypt(sharePlusNum, 'base64');
                    console.log(encryptedSecretShare)
                    await insertShare(electionId, adminId, encryptedSecretShare);
                    index++
                }
                alert("Encrypted shares stored to database")

                await axios.post("/api/admin/insert/updateStatus", {
                    election_id: electionId,
                    status: "PENDING",
                });

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
                alert("An error occurred while generating key.");
            }
        };
    }

    async function insertShare(electionId, adminId, encryptedSecretShare) {
        try {
            await axios.post("/api/admin/insert/createShare", {
                election_id: parseInt(electionId),
                admin_id: parseInt(adminId),
                encrypted_ss: encryptedSecretShare,
            });
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.err;
                alert(`Error: ${errorMessage}`);
            } else {
                console.error(error);
                alert(".");
            }
        }
    }

    async function deleteElection(electionId) {
        try {
            if (confirm("Confirm to delete this election?")) {

                await axios.post("/api/admin/delete/deleteElection", {
                    election_id: electionId,
                });
                await axios.post("/api/admin/insert/createActivity", {
                    username: username,
                    activity_description: "Delete Election",
                    logs_data: "Election id: " + electionId.toString(),
                });
            }
            alert("Election Deleted! Redirecting back to previous page...");

            router.back();

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.err;
                alert(`Error: ${errorMessage}`);
            } else {
                console.error(error);
                alert("An error occurred while deleting the candidate.");
            }
        }
    }

    if (electionDataById.status === "PENDING" || electionDataById.status === "NO KEYPAIR") {
        return (

            <div>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <div style={{ padding: '2%' }}>
                    <h2 style={{ textAlign: "center", }}>Election {electionId}</h2>
                    <Form ref={formRef}>
                        <Form.Group className="mb-3">
                            <Form.Label>Election Title</Form.Label>
                            <Form.Control type="text" name="updateElectionTitle" defaultValue={electionDataById.election_title} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Election Description</Form.Label>
                            <Form.Control as="textarea" rows={4} cols={50} name="updateElectionDescription" defaultValue={electionDataById.election_description} />
                        </Form.Group>
                        <Button variant="dark" onClick={() => handleShowAdminRoll()} disabled={keyPairsGenerated}>Assign admins and generate keypairs</Button>
                        <br></br><br></br>
                        {(showAdminRoll) && (
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>Admin ID</th>
                                        <th>Admin Name</th>
                                        <th>Assign to Election</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminRoll.map((item) => (
                                        <tr key={item.admin_id}>
                                            <td>{item.admin_id}</td>
                                            <td>{item.User.name}</td>
                                            <td><Form.Check
                                                id='default-checkbox'
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        //add to list
                                                        setChecked([...checked, { admin_id: item.admin_id, name: item.User.name },]);
                                                    } else {
                                                        //remove from list
                                                        setChecked(
                                                            checked.filter((wut) => wut.user_id !== item.user_id),
                                                        )
                                                    }
                                                }}
                                                type='checkbox'

                                            /></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <br></br>
                                <Button variant="dark" onClick={() => generateKeyPairs(electionId)}>Generate</Button>
                            </Table>
                        )}
                        Add Ballot <Link href={`../createBallot?param=${electionId}`} as="/createBallot">
                            <Button variant="info">+</Button>
                        </Link>
                        <div>
                            Ballots:
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Ballot Title</th>
                                        <th>View Ballots</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ballotDataByElectionId.map((item) => (
                                        <tr key={item.ballot_id}>
                                            <td>{item.ballot_id}</td>
                                            <td>{item.ballot_title}</td>
                                            <td>
                                                <Link href={`/updateBallots/${item.ballot_id}?param=${electionDataById.status}`}>
                                                    <Button variant="outline-info">View Ballot</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <Button variant="outline-dark" onClick={() => updateElection(electionDataById.election_id)}>Save Election</Button>
                        <Button style={{ float: 'right' }} variant="outline-dark" onClick={() => deleteElection(electionDataById.election_id)}>Delete Election</Button>
                    </Form>
                </div>
            </div>

        )
    } else if (electionDataById.status === "ONGOING") {
        return (
            <>
                <div>
                    <PrimaryNavBar />
                    <SecondaryNavBar />
                    <div style={{ padding: '2%' }}>
                        <h2 style={{ textAlign: "center", }}>Election {electionId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Election Title</Form.Label>
                                <Form.Control type="text" name="updateElectionTitle" defaultValue={electionDataById.election_title} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Election Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateElectionDescription" defaultValue={electionDataById.election_description} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date & Time</Form.Label>
                                <Form.Control type="text" name="updateStartDate" defaultValue={electionDataById.start_date} disabled />
                            </Form.Group>
                            <Button variant="dark" onClick={() => downloadSecretShare(electionId)}>Download Secret Share</Button>
                            <br></br><br></br>
                            Ballots:
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Ballot Title</th>
                                        <th>View Ballots</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ballotDataByElectionId.map((item) => (
                                        <tr key={item.ballot_id}>
                                            <td>{item.ballot_id}</td>
                                            <td>{item.ballot_title}</td>
                                            <td>
                                                <Link href={`/updateBallots/${item.ballot_id}?param=${electionDataById.status}`}>
                                                    <Button variant="outline-info">View Ballot</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Form>
                    </div>
                </div>
            </>
        )
    } else if (electionDataById.status === "ENDED") {
        return (
            <>
                <div>
                    <PrimaryNavBar />
                    <SecondaryNavBar />
                    <div style={{ padding: '2%' }}>
                        <h2 style={{ textAlign: "center", }}>Election {electionId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Election Title</Form.Label>
                                <Form.Control type="text" name="updateElectionTitle" defaultValue={electionDataById.election_title} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Election Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateElectionDescription" defaultValue={electionDataById.election_description} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date & Time</Form.Label>
                                <Form.Control type="text" name="updateStartDate" defaultValue={electionDataById.start_date} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date & Time</Form.Label>
                                <Form.Control type="text" name="updateEndDate" defaultValue={electionDataById.end_date} disabled />
                            </Form.Group>
                            <Button variant="dark" onClick={() => downloadSecretShare(electionId)}>Download Secret Share</Button>
                            <br></br><br></br>
                            Ballots:
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Ballot Title</th>
                                        <th>View Ballots</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ballotDataByElectionId.map((item) => (
                                        <tr key={item.ballot_id}>
                                            <td>{item.ballot_id}</td>
                                            <td>{item.ballot_title}</td>
                                            <td>
                                                <Link href={`/updateBallots/${item.ballot_id}?param=${electionDataById.status}`}>
                                                    <Button variant="outline-info">View Ballot</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Form>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <>
                <h2>Invalid Election</h2>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <p>Election has ended or been voided</p>
            </>
        )
    }
}