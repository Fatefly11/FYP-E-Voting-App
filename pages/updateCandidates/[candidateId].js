import { useRouter } from "next/router";
import { useRef } from "react"
import { Form, Button } from "react-bootstrap"
import { fetchCandidateById } from "../api/admin/query/candidateById"
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import axios from "axios";
import { withSession } from "../../lib/session";

import { useEffect, useState } from "react";

export const getServerSideProps = withSession(async (context) => {
    const id = context.params.candidateId;
    const candidateDataById = await fetchCandidateById(id)

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
            props: { candidateDataById },
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

export default function Page({ candidateDataById }) {
    const router = useRouter()
    const candidateId = router.query.candidateId
    const { param } = router.query;
    const electionStatus = param;

    const formRef = useRef();

    const [username, setUsername] = useState(null);

    useEffect(() => {
        // Perform localStorage action
        const username = sessionStorage.getItem('username');
        setUsername(username);
    }, [])

    async function updateCandidate(candidateId) {
        const {
            updateCandidateName,
            updateCandidateDescription,
            updateCandidateBio,
            updateCandidatePicture,
        } = formRef.current;

        const name = updateCandidateName.value;
        const description = updateCandidateDescription.value;
        const bio = updateCandidateBio.value;
        const picture = updateCandidatePicture.value;

        try {
            await axios.post("/api/admin/insert/updateCandidate", {
                candidate_id: candidateId,
                name,
                description,
                bio,
                picture,
            });

            await axios.post("/api/admin/insert/createActivity", {
                username: username,
                activity_description: "Update Candidate",
                logs_data: "Candidate id: " + candidateId.toString(),
            });

            alert("Candidate Updated! Redirecting back to previous page...")

            router.back()

        } catch (error) {
            if (error.response) {
                // If the API returns an error response with a status code
                const errorMessage = error.response.data.err;
                alert(`Error: ${errorMessage}`);
            } else {
                // If the request fails entirely (network error, etc.)
                console.error(error);
                alert("An error occurred while updating the candidate.");
            }
        }
    }

    async function deleteCandidate(candidateId) {
        try {
            if (confirm("Confirm to delete this candidate?")) {
                await axios.post("/api/admin/delete/deleteCandidate", {
                    candidate_id: candidateId,
                });
                await axios.post("/api/admin/insert/createActivity", {
                    username: username,
                    activity_description: "Delete Candidate",
                    logs_data: "Candidate id: " + candidateId.toString(),
                });
            }
            alert("Candidate Deleted! Redirecting back to previous page...");

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
                        <h2 style={{ textAlign: "center", }}>Candidate {candidateId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Name</Form.Label>
                                <Form.Control type="text" name="updateCandidateName" defaultValue={candidateDataById.name} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateCandidateDescription" defaultValue={candidateDataById.description} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Bio</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateCandidateBio" defaultValue={candidateDataById.bio} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Picture:</Form.Label>
                                <Form.Control type="text" name="updateCandidatePicture" defaultValue={candidateDataById.picture} />
                            </Form.Group>
                            <Button variant="outline-dark" onClick={() => updateCandidate(candidateId)}>Save Candidate</Button>
                            <Button style={{ float: 'right' }} variant="outline-dark" onClick={() => deleteCandidate(candidateId)}>Delete Candidate</Button>
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
                        <h2 style={{ textAlign: "center", }}>Candidate {candidateId}</h2>
                        <Form ref={formRef}>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Name</Form.Label>
                                <Form.Control type="text" name="updateCandidateName" defaultValue={candidateDataById.name} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Description</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateCandidateDescription" defaultValue={candidateDataById.description} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Bio</Form.Label>
                                <Form.Control as="textarea" rows={4} cols={50} name="updateCandidateBio" defaultValue={candidateDataById.bio} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Candidate Picture:</Form.Label>
                                <Form.Control type="text" name="updateCandidatePicture" defaultValue={candidateDataById.picture} disabled />
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <>
                <h2>Invalid Candidate</h2>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <p>Candidate does not exist</p>
            </>
        )
    }
}