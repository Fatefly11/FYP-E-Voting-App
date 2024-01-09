'use client';
import SEAL from 'node-seal'
import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import { fetchTotalShares } from '../api/admin/query/totalShares';
import tallyVotes from '../api/admin/fetchVotesData';
import { fetchElectionAndBallotsById } from '../api/admin/query/electionById';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { withSession } from "../../lib/session";
import { join } from 'shamir';
import {
    Container,
    Button,
    Modal,
    Row,
    Col,
    Card,
} from "react-bootstrap";


export const getServerSideProps = withSession(async (context) => {
    const id = context.params.electionId;
    const totalShares = await fetchTotalShares(id);
    const minimumShares = Math.ceil(totalShares / 2);
    const electionData = await fetchElectionAndBallotsById(id);
    const electionId = electionData.election_id;
    const electionTitle = electionData.election_title;
    const electionDescription = electionData.election_description;
    const ballotTitle = electionData.Ballot[0].ballot_title;
    const ballotCandidates = electionData.Ballot[0].Candidate;
    const currentBallot = electionData.Ballot[0];
    const ballotId = currentBallot.ballot_id;

    const cipherResult = await tallyVotes(ballotId);

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
            props: {
                cipherResult, currentBallot, electionData, electionId,
                electionTitle,
                electionDescription,
                ballotTitle,
                ballotCandidates,
                minimumShares,
            },
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


type SecFileReaderComponentProps = {
    setFileContent: Dispatch<SetStateAction<string[]>>;

    electionData: any;

    currentBallot: any;

    electionId: number;
    electionTitle: string;
    electionDescription: string;
    ballotTitle: string;
    ballotCandidates: any;

    handleShow: () => void;

    handleClose: () => void;

    setWinner: Dispatch<SetStateAction<any>>;

    secKeyFile: any;

    decrypt: any;

    cipherResult: any;
}



function SecFileReaderComponent({
    setFileContent,
    currentBallot,
    handleShow,
    setWinner,
    secKeyFile,
    decrypt,
    cipherResult,
}: SecFileReaderComponentProps) {

    const handleFileChange = (event) => {
        const files = event.target.files;
        const fileContents = [];
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                fileContents.push(content.toString())
            };
            reader.readAsText(file);
            setFileContent(fileContents);
        }
    };

    const decryptAndShowTheWinner = async () => {
        try {
            const utf8Decoder = new TextDecoder();
            const uint8Arrays = {}
            for (const file in secKeyFile) {
                const base64String = secKeyFile[file];
                const shareNum = base64String.charAt(0)
                const newBase64String = (base64String.slice(1))
                const binaryString = atob(newBase64String);
                const uint8Array = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    uint8Array[i] = binaryString.charCodeAt(i);
                }
                uint8Arrays[shareNum] = uint8Array;
            }
            console.log(uint8Arrays)
            const recovered = join(uint8Arrays);
            console.log(recovered);
            const secretKey = (utf8Decoder.decode(recovered));
            console.log(secretKey);

            // get the loaded secret key
            const seckey = secretKey
            // decrypt the tally result of the encrypted votes data
            var decryptedData = await decrypt(cipherResult, seckey)
            // slice the array to the amount of candidate in the ballot
            decryptedData = decryptedData.slice(0, currentBallot.Candidate.length)
            // get the max vote amount to deterine the winner
            const resultArray = []
            decryptedData.forEach((element, index) => {
                resultArray.push({ data: currentBallot.Candidate[index], vote: element })
            }
            )
            const maxVote = Math.max(...resultArray.map(o => o.vote))
            // console.log(maxVote)
            // console.log(resultArray.filter(o=>o.vote===maxVote).map(o=>o.name))
            const winner = resultArray.filter(o => o.vote === maxVote)
            winner.map((item) => (
                console.log(item)
            ))
            handleShow()
            setWinner(winner)

        }
        catch (err) {
            alert("try again with the correct secret key")
        }

    };



    return (
        <div className='container-fluid'>
            {/* <h1>Upload secret key here:</h1> */}

            <div className="mb-3">

                <input className="form-control" type="file" id="formFile" multiple onChange={handleFileChange} />
            </div>
            {/* <input type="file" onChange={handleFileChange} /> */}
            <div>
                <button type="button" className="btn btn-primary btn-lg" id='decrypt' onClick={decryptAndShowTheWinner}>Decrypt and View Winner</button>
                {/* <button id='decrypt' onClick={decryptAndShowTheWinner}>decrypt</button> */}
            </div>
        </div>
    );
}

export const BallotComponent: React.FC<{ ballotTitle: string, ballotCandidates: Array<any> }> = ({ ballotCandidates }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

    const handleShowModal = (candidate: any) => {
        setSelectedCandidate(candidate);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
        setShowModal(false);
    };

    return (
        <Container>
            <hr />
            <Row>
                {ballotCandidates.map((item: any) => (
                    <Col key={item.candidate_id} xs={12} sm={6} md={4} lg={3}>
                        <Card className="mb-4" style={{ width: '14rem' }}>
                            {item.picture ? (
                                <div className="card-img-top" style={{ width: "100%", paddingTop: "100%", background: `url(${item.picture}) no-repeat center center / cover` }}></div>
                            ) : (
                                <div className="card-img-top" style={{ width: "100%", paddingTop: "100%", background: `url(/images/default-empty.png) no-repeat center center / cover` }}></div>
                            )}

                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Button variant="primary" onClick={() => handleShowModal(item)}>Details</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={handleCloseModal}>
                {selectedCandidate && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedCandidate.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedCandidate.description}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
}

export const Page = ({ cipherResult, currentBallot, electionId,
    electionTitle,
    electionDescription,
    ballotTitle,
    ballotCandidates, electionData, minimumShares }) => {
    // console.log(cipherResult)
    const [winnerData, setWinner] = useState([])
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [secKeyFile, setFileContent] = useState([]);
    const totalVoter = electionData.Voter.length
    const totalVoted = electionData.Voter.filter(o => o.vote_status === true).length


    const totalVote = winnerData.length > 0 ? <h1>Total Vote : {winnerData[0].vote}</h1> : null;

    return (
        <div>

            <PrimaryNavBar />
            <SecondaryNavBar />
            <div className='col-lg-8 mx-auto p-3 py-md-5'>
                <header className="d-flex align-items-center pb-3 mb-5 border-bottom">
                    <a className="d-flex align-items-center text-dark text-decoration-none">
                        <span className="fs-4">Election ID {electionId}</span>
                    </a>
                </header>
                <main className="border-2 border-black min-h-[inherit] flex justify-center items-center font-spartan transition-all duration-200 ease-in-out">

                    <h1>{electionTitle}</h1>
                    <p className="fs-5 col-md-8">{electionDescription}</p>






                    <div className="flex flex-col w-1/12 border-black ">

                        <hr />

                        <h3>Candidates involved in {ballotTitle}</h3>
                        <Container>
                            <Row>
                                {ballotCandidates.map((item) => (
                                    <Col key={item.candidate_id} xs={12} sm={6} md={4} lg={3}>
                                        <BallotComponent
                                            ballotTitle={ballotTitle}
                                            ballotCandidates={[
                                                { candidate_id: item.candidate_id, name: item.name, description: item.description, picture: item.picture },
                                            ]}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Container>

                        <hr />
                        <div className="row g-5">
                            <div className="col-md-6">
                                <span className="fs-4">Amount of registered voter: {totalVoter}</span>

                            </div>

                            <div className="col-md-6">
                                <span className="fs-4">Amount of votes gathered: {totalVoted}</span>

                            </div>
                        </div>

                        <hr className="col-3 col-md-2 mb-5" />

                        <div className="row g-5">
                            <div className="col-md-6">
                                <h2>Upload Secret Shares</h2>
                                <h2>&#40;Minimum {minimumShares}&#41;</h2>
                                <SecFileReaderComponent setFileContent={setFileContent}
                                    currentBallot={currentBallot}
                                    handleShow={handleShow}
                                    handleClose={handleClose}
                                    setWinner={setWinner}
                                    secKeyFile={secKeyFile}
                                    decrypt={decrypt}
                                    cipherResult={cipherResult} electionData={undefined} electionId={0} electionTitle={''} electionDescription={''} ballotTitle={''} ballotCandidates={undefined} />

                            </div>

                            <div className="col-md-6">
                                <h2>Guides</h2>
                                <p>The vote tally is done in the server, you just need to decrypt the encrypted tally data</p>
                                <ol className="icon-list">
                                    <li><a >Load the secret share files: secretShare_election_{electionId}_adminID.txt</a></li>
                                    <li><a >Click the Decrypt Button</a></li>
                                    <li><a >A popup modal will show the winner of the vote with the amount of vote gathered</a></li>
                                    <li><a >Close the modal if you are done</a></li>
                                </ol>
                            </div>
                        </div>
                        {/* load secret key component */}

                        {/* modal to display the winner of the candidate with the most votes (duplicate) */}
                        <Modal
                            size="xl"
                            show={show}
                            onHide={handleClose}
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Election Winner!</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Container>
                                    <Row key="winner">
                                        {totalVote}
                                        {winnerData.map((item) => (
                                            <Col key={item.data.candidate_id}>
                                                <Card style={{ width: "16rem" }}>
                                                    <Card.Img
                                                        src={item.data.picture}
                                                        width={200}
                                                        height={200}
                                                        alt="candidate picture"
                                                    />
                                                    <Card.Body>
                                                        <Card.Title>{item.data.name}</Card.Title>
                                                        {/* <Card.Text>{item.data.description}</Card.Text> */}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Container>
                            </Modal.Body>
                            <Modal.Footer></Modal.Footer>
                        </Modal>
                    </div>
                </main>
            </div>
        </div>
    );




    async function decrypt(voteCipher, secretKey) {
        // console.log('ciphertext',voteCipher)
        // console.log(secretKey)
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

        const loadedSecretKey = seal.SecretKey()
        loadedSecretKey.load(context, secretKey)
        console.log("Loaded")

        // // Create the PlainText(s) 
        const plaintext = seal.PlainText()

        // // Create the CipherText(s) 
        const ciphertext = seal.CipherText()
        ciphertext.load(context, voteCipher)


        // // Create an Evaluator
        // const evaluator = seal.Evaluator(context)

        // // Create a BatchEncoder (only bfv/bgv SchemeType)
        const batchEncoder = seal.BatchEncoder(context)

        //  // Create an Decryptor
        const decryptor = seal.Decryptor(
            context,
            loadedSecretKey
        )
        //  // Decrypt the ciphertext to the plaintext
        decryptor.decrypt(ciphertext, plaintext)
        // console.log("base64",plaintext.save())
        //   // Encode data to a PlainText
        const decodedData = batchEncoder.decode(
            plaintext
        )

        console.log(decodedData)


        return decodedData

    }


}

export default Page;