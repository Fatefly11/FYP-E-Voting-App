import Link from 'next/link';

import PrimaryNavBar from '../components/PrimaryNavBar'

import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Button } from "react-bootstrap";
import { fetchElectionData } from "./api/admin/query/adminDashboard";
import { withSession } from "../lib/session";
import SecondaryNavBar from '../components/SecondaryNavBar';

export const getServerSideProps = withSession(async ({ req }) => {
  const electionList = await fetchElectionData();
  try {
    const isAuthenticated = req.session.get('userid');
    const isAdmin = req.session.get('isAdmin');

    if (!isAuthenticated || !isAdmin) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

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
const TableComponent = ({ electionData }) => {

  const [buttonStates, setButtonStates] = useState({});
  const electionList = electionData ? electionData.electionList : [];

  const [username, setUsername] = useState(null);

  const [query, setQuery] = useState('');

  //Our search filter function
  const searchFilter = (array) => {

    return array.filter(
      (el) =>
        el.election_title.toLowerCase().includes(query.toLowerCase())
    )
  }

  //Applying our search filter function to our data received from the API
  const filtered = searchFilter(electionList)

  //Handling the input on our search bar
  const handleChange = (e) => {
    setQuery(e.target.value)
  }
  useEffect(() => {
    // Perform localStorage action
    const username = sessionStorage.getItem('username');
    setUsername(username);
  }, [])

  const getStatusBasedButtonState = (electionItem) => {
    const electionStatus = electionItem.status;
    // console.log(electionItem.Ballot)
    const ballotData = electionItem.Ballot;
    const voterData = electionItem.Voter;
    // conditional check election status
    // check if there is no ballot
    if (ballotData.length == 0) {
      console.log("No Ballot")
      return 'disableButton';
    } else {
      // check if there is enough candidate for the election to start
      if (ballotData[0].Candidate.length < 2 || voterData.length <= 3) {
        return 'disableButton';
      } else {
        switch (electionStatus) {
          case 'PENDING':
            return 'start';
          case 'ONGOING':
            return 'stop';
          case 'ENDED':
            return 'tally';
          case 'NOKEYPAIR':
            return 'disableButton';
        }
      }
    }


  };

  async function updateElectionStatus(electionId, date, statusParam, activityDesc) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await axios.post("/api/admin/insert/updateStatus", {
      election_id: electionId,
      status: statusParam,
      // start_date: new Date()
      start_date: date
    });

    await axios.post("/api/admin/insert/createActivity", {
      username: username,
      activity_description: activityDesc,
      logs_data: "Election id: " + electionId.toString()
        + ", started on: " + date,
    });
    
    await delay(10)
  }

  async function handleStartElection(electionId) {
    try {
      if (confirm("Confirm to start the election?")) {
        var date = new Date()
        await updateElectionStatus(electionId, date, 'ONGOING', 'Start Election')

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
        alert("An error occurred while starting the election.");
      }
    };
  }

  async function handleStopElection(electionId) {
    try {
      if (confirm("Confirm to stop the election?")) {
        var date = new Date()
        updateElectionStatus(electionId, date, 'ENDED', 'End Election')

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
        alert("An error occurred while stopping the election.");
      }
    };
  };

  return (
    <Container>

      <Table striped bordered hover variant="dark" className='rounded rounded-3 overflow-hidden'>
        <thead>
          <tr>
            <th colSpan={6}>
              <div className="justify-between align-items-center px-2">
                <h1 className="float-start">Election Table</h1>
                <div className="d-flex float-end">
                  <input
                    onChange={handleChange}
                    type="text"
                    placeholder="Search by Election Title"
                    className="form-control"
                  />
                </div>
              </div>
            </th>
          </tr>


          <tr>
            <th>ID</th>
            <th>Election Title</th>
            <th>Status</th>
            <th>Election Details</th>
            <th>Electoral Roll</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => {
            const buttonState = getStatusBasedButtonState(item);
            return (
              <tr key={item.election_id}>
                <td>{item.election_id}</td>
                <td>{item.election_title}</td>
                <td>{item.status}</td>
                <td className='justify-center'>
                  <Link href={`/updateElections/${item.election_id}`}>
                    <Button variant="primary">View</Button>
                  </Link>
                </td>
                <td>
                  <Link href={`/electoralRoll/${item.election_id}`}>
                    <Button variant="primary">View</Button>
                  </Link>
                </td>
                <td>
                  {buttonState === 'disableButton' && (
                    <Button variant="secondary" disabled onClick={() => handleStartElection(item.election_id)}>Start</Button>
                  )}
                  {buttonState === 'start' && (
                    <Button variant="primary" onClick={() => handleStartElection(item.election_id)}>Start</Button>
                  )}
                  {buttonState === 'stop' && (
                    <Button variant="danger" onClick={() => handleStopElection(item.election_id)}>Stop</Button>
                  )}
                  {buttonState === 'tally' && (
                    <Link href={`/tallyVotes/${item.election_id}`}>
                      <Button variant="success">Tally</Button>
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

const AdminPage = (electionList, userName) => {
  const router = useRouter();
  return (
    <>

      <div>
        <PrimaryNavBar />
      </div>


      <SecondaryNavBar />
      <Container className='overflow-auto'>
        {/* <!-- Top navigation--> */}
        {/* <nav className="navbar navbar-expand-lg navbar-light bg-light
                    border-bottom">    
                    <div className="container-fluid">
                    <button className="btn btn-primary" id="sidebarToggle"><span className="navbar-toggler-icon"/></button>
                    </div>
                  </nav> */}


        <TableComponent electionData={electionList} />
      </Container>
    </>
  );
};

export default AdminPage;

function delay(arg0: number) {
  throw new Error('Function not implemented.');
}
