import React from "react";
import { useState } from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";
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

export type ElectionProps = {
  id: number;
  title: string;
  description: string;
};
// function ElectionDescModal({electionTitle, electionDesc, candidateData})
function ElectionDescModal({ electionTitle, electionDesc }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          {/* <VotingModal candidateData={candidateData}/> */}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
const Election: React.FC<{ election: ElectionProps }> = ({ election }) => {
  const description = election.description
    ? election.description
    : "Unknown description";
  return (
    <>
      <tr key={election.id}>
        <td>{election.id}</td>
        <td>{election.title}</td>
        {/* <td><ElectionDescModal electionTitle = {election.title} electionDesc = {election.description} candidateData={candidateData}/></td>  */}
        <td>
          <ElectionDescModal
            electionTitle={election.title}
            electionDesc={description}
          />
        </td>
      </tr>
    </>
  );
};

export default Election;
