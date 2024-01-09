import { useRouter } from "next/router";
import { useRef } from "react"
import { Table, Form, Button } from "react-bootstrap"
import { fetchBallotById } from "../api/admin/query/ballotById"
import { fetchCandidateByBallotId } from "../api/admin/query/candidateByBallotId"
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import axios from "axios";
import Link from 'next/link';
import { withSession } from "../../lib/session";

import { useEffect, useState } from "react";

export const getServerSideProps = withSession(async (context) => {
    const id = context.params.ballotId;

    const ballotDataById = await fetchBallotById(id)
    const candidateDataByBallotId = await fetchCandidateByBallotId(id)

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
            props: { ballotDataById, candidateDataByBallotId },
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

export default function Page({ ballotDataById, candidateDataByBallotId }) {
    const router = useRouter()
    const ballotId = router.query.ballotId
    const { param } = router.query;
    const electionStatus = param;

    const formRef = useRef();

    //
    const [username, setUsername] = useState(null);

    useEffect(() => {
        // Perform localStorage action
        const username = sessionStorage.getItem('username');
        setUsername(username);
    }, [])


    async function updateBallot(ballotId) {
        const {
            updateBallotTitle,
            updateBallotDescription,
        } = formRef.current;

        const ballot_title = updateBallotTitle.value;
        const ballot_description = updateBallotDescription.value;
        try {
            await axios.post("/api/admin/insert/updateBallot", {
                ballot_id: ballotId,
                ballot_title,
                ballot_description,
            });

            //

            await axios.post("/api/admin/insert/createActivity", {
                username: username,
                activity_description: "Update Ballot",
                logs_data: "Ballot id: " + ballotId.toString(),
            });
            //

            alert("Ballot Updated! Redirecting back to previous page...")

            router.back()
        } catch (error) {
            if (error.response) {
                // If the API returns an error response with a status code
                const errorMessage = error.response.data.err;
                alert(`Error: ${errorMessage}`);
            } else {
                // If the request fails entirely (network error, etc.)
                console.error(error);
                alert("An error occurred while updating the ballot.");
            }
        }
    }

    async function deleteBallot(ballotId) {
        try {
            if (confirm("Confirm to delete this ballot?")) {

                await axios.post("/api/admin/delete/deleteBallot", {
                    ballot_id: ballotId,
                });
                await axios.post("/api/admin/insert/createActivity", {
                    username: username,
                    activity_description: "Delete Ballot",
                    logs_data: "Ballot id: " + ballotId.toString(),
                });
                //
            }
            alert("Ballot Deleted! Redirecting back to previous page...");

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

    if (electionStatus === "PENDING" || electionStatus === "NO KEYPAIR") {
        return (
            <>
                <div>
                    <PrimaryNavBar />
                    <SecondaryNavBar />
                    <div style={{ padding: '2%' }}>
                        <h2 style={{ textAlign: "center" }}>Ballot {ballotId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ballot Title</Form.Label>
                                <Form.Control type="text" name="updateBallotTitle" defaultValue={ballotDataById.ballot_title} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ballot Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateBallotDescription" defaultValue={ballotDataById.ballot_description} />
                            </Form.Group>
                            Add Candidate <Link href={`../createCandidate?param=${ballotId}`} as="/createCandidate">
                                <Button variant="info">+</Button>
                            </Link>
                            <div>
                                Candidates:
                            </div>
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Candidate Name</th>
                                        <th>View Candidates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidateDataByBallotId.map((item) => (
                                        <tr key={item.candidate_id}>
                                            <td>{item.candidate_id}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <Link href={`/updateCandidates/${item.candidate_id}?param=${electionStatus}`}>
                                                    <Button variant="outline-info">View Candidate</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Button variant="outline-dark" onClick={() => updateBallot(ballotId)}>Save Ballot</Button>
                            <Button style={{ float: 'right' }} variant="outline-dark" onClick={() => deleteBallot(ballotId)}>Delete Ballot</Button>
                        </Form>
                    </div>
                </div>
            </>
        )
    } else if (electionStatus === "ONGOING" || electionStatus === "ENDED") {
        return (
            <>
                <div>
                    <PrimaryNavBar />
                    <SecondaryNavBar />
                    <div style={{ padding: '2%' }}>
                        <h2 style={{ textAlign: "center", }}>Ballot {ballotId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ballot Title</Form.Label>
                                <Form.Control type="text" name="updateBallotTitle" defaultValue={ballotDataById.ballot_title} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ballot Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateBallotDescription" defaultValue={ballotDataById.ballot_description} disabled />
                            </Form.Group>
                            <Table striped bordered hover variant="dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Candidate Name</th>
                                        <th>View Candidates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidateDataByBallotId.map((item) => (
                                        <tr key={item.candidate_id}>
                                            <td>{item.candidate_id}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <Link href={`/updateCandidates/${item.candidate_id}?param=${electionStatus}`}>
                                                    <Button variant="outline-info">View Candidate</Button>
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
                <h2>Invalid Ballot</h2>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <p>Ballot does not exist</p>
            </>
        )
    }
}