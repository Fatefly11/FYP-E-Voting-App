import { useRouter } from "next/router";
import { useState } from "react"
import { Table, Form, Button } from "react-bootstrap"
import { fetchElectionStatus, fetchElectoralRoll, fetchVoters, fetchVoted, fetchTotal } from "../api/admin/query/electoralRoll"
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import { withSession } from "../../lib/session";

import axios from "axios";
import { useEffect } from "react";

export const getServerSideProps = withSession(async (context) => {
    const id = context.params.electionId;

    const electionStatus = await fetchElectionStatus(id)
    const electoralRoll = await fetchElectoralRoll(id)
    const selectionList = await fetchVoters(id)

    const voted = await fetchVoted(id)
    const votedCount = parseInt(voted[0].vote_status.toString())

    const total = await fetchTotal(id)
    const totalCount = parseInt(total[0].vote_status.toString())

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
            props: { electoralRoll, selectionList, electionStatus, votedCount, totalCount },
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

function DisplayElectoralRoll({ data, votedCount, totalCount }) {
    return (
        <>
            <div style={{ padding: '2%' }}>
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th>Voter ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Vote Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.user_id}>

                                <td>{item.voter_id}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.vote_status == true ? "voted" : "not voted"}</td>

                            </tr>
                        ))}
                    </tbody>
                </Table>

                <p>Vote Count: {votedCount}/{totalCount}</p>
            </div>
        </>
    )
}


function SelectElectoralRoll({ data }) {

    const router = useRouter()

    const electionId = parseInt(router.query.electionId as string)

    const [checked, setChecked] = useState<any[]>([])

    //lala
    const [username, setUsername] = useState(null);

    useEffect(() => {
        // Perform localStorage action
        const username = sessionStorage.getItem('username');
        setUsername(username);
    }, [])
    for (var i = 0; i < checked.length; i++) {
        console.log("checked is: ", checked)
        console.log("checked[checked.length - 1] is: ", checked[checked.length - 1])
        console.log("checked.length is: ", checked.length)
    }
    //haha

    const handleFormSubmit = async () => {
        const response = await fetch('../api/admin/insert/selectVoterList', {
            method: 'POST',
            body: JSON.stringify(checked)
        })

        //lalala
        var lala: string = ""

        for (var i = 0; i < checked.length; i++) {
            lala += checked[i].user_id.toString() + ", "
        }
        await axios.post("/api/admin/insert/createActivity", {
            username: username,
            activity_description: "Add Voter(s)",
            logs_data: "Voter id(s): " + lala
                + "added to election id: " + electionId.toString(),
        });


        window.location.reload();
    }

    return (
        <>
            <Form onSubmit={handleFormSubmit}>
                <Table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.user_id}>
                                <td>{item.user_id}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>
                                    <Form.Check
                                        id='default-checkbox'
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                //add to list
                                                setChecked([...checked, { user_id: item.user_id, election_id: electionId },]);
                                            } else {
                                                //remove from list
                                                setChecked(
                                                    checked.filter((wut) => wut.user_id !== item.user_id),
                                                )
                                            }
                                        }}
                                        type='checkbox'

                                    />
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button variant="outline-dark" type="submit">Submit</Button>
                <p></p>
            </Form>
        </>

    );
}

// gets the electoral roll for a specific election id
export default function Page({ electoralRoll, selectionList, electionStatus, votedCount, totalCount }) {
    const router = useRouter()

    const electionId = router.query.electionId

    const [state, setState] = useState('first')

    const DisplayRollButton = () => {
        return (
            <>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <div style={{ padding: '2%' }}>
                    <h2 style={{ textAlign: "center" }}>Election {electionId}</h2>
                    <DisplayElectoralRoll data={electoralRoll} votedCount={votedCount} totalCount={totalCount} />
                </div>
            </>

        )
    }

    const status = electionStatus[0].status

    if (status === "PENDING" || status === "NO KEYPAIR") {
        return (
            <>
                {state === 'first' && <>
                    <PrimaryNavBar />
                    <SecondaryNavBar />
                    <div style={{ padding: '2%' }}>
                        <h2 style={{ textAlign: "center" }}>Election {electionId}</h2>
                        <SelectElectoralRoll data={selectionList} />
                        <Button variant="outline-dark" type='submit' onClick={() => setState('second')}>Display Electoral Roll</Button>
                    </div>
                </>}
                {state === 'second' && <DisplayRollButton />}
            </>

        )
    } else if (status === "ONGOING" || status === "ENDED") {
        return (
            <>
                <PrimaryNavBar />
                <SecondaryNavBar />
                <div style={{ padding: '2%' }}>
                    <h2 style={{ textAlign: "center" }}>Election {electionId}</h2>
                    <DisplayElectoralRoll data={electoralRoll} votedCount={votedCount} totalCount={totalCount} />
                </div>
            </>
        )
    } else {
        <>
            <h2>Election {electionId}</h2>
            <p>Election has ended or been voided</p>
        </>
    }

}




