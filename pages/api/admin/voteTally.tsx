import { clickVote } from '../../voterPage';
import prisma from "../../../lib/prisma";
import SEAL from 'node-seal'
import { withSession } from "../../../lib/session";

export const getServerSideProps = withSession(async ({ req }) => {
  const secretKey = req.session.get('secretKey');
  console.log("please fucking work", secretKey);

  return {
    props: secretKey,
  }
});

export async function grabData(publicKey, secretKey, ballotId) {
  try {
    // Use Prisma Client to fetch election data
    const votesData = await prisma.vote.findMany({

      select: {
        vote_data: true
      },
      where: {
        ballot_id: ballotId
      },
    });

    const finalvalue = await reqVote(votesData, publicKey, secretKey);
    //console.log(finalvalue);
    return finalvalue;

  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

export async function reqVote(votesData, publicKey, secretKey) {
  try {

    // Wait for the web assembly to fully initialize
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
    encParms.setPlainModulus(
      seal.PlainModulus.Batching(
        polyModulusDegree,
        bitSize
      )
    )

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

    // Get the SecretKey from the keyGenerator
    //const Secret_key_Keypair_A_ = keyGenerator.secretKey()
    // const loadSK = seal.SecretKey();
    // loadSK.load(context, secretKey);
    const loadSK = keyGenerator.secretKey()
    loadSK.load(context, secretKey);

    // Get the PublicKey from the keyGenerator
    const Public_key_Keypair_A_ = seal.PublicKey()
    Public_key_Keypair_A_.load(context, publicKey);

    ////////////////////////
    // Variables
    ////////////////////////

    // Create the PlainText(s) 
    const Plain_A = seal.PlainText()
    const Plain_B = seal.PlainText()
    const Plain_C = seal.PlainText()

    // Create the CipherText(s) 
    const Cipher_A = seal.CipherText()
    const Cipher_B = seal.CipherText()
    const Cipher_C = seal.CipherText()

    ////////////////////////
    // Instances
    ////////////////////////

    // Create an Evaluator
    const evaluator = seal.Evaluator(context)

    // Create a BatchEncoder (only bfv/bgv SchemeType)
    const batchEncoder = seal.BatchEncoder(context)

    // batchEncoder.encode(
    //     Uint32Array.from(voteValue),
    //     Plain_A
    // );

    // Create an Encryptor
    const encryptor = seal.Encryptor(
      context,
      Public_key_Keypair_A_
    )

    // Create a Decryptor
    const decryptor = seal.Decryptor(
      context,
      loadSK
    )

    ////////////////////////
    // Homomorphic Functions
    ////////////////////////

    // Encrypt a PlainText
    encryptor.encrypt(
      Plain_A,
      Cipher_A
    )


    const savedCipherText = seal.CipherText();
    const voteDataArr = votesData.map(item => item.vote_data);
    voteDataArr.forEach(data => {
      savedCipherText.load(context, data);

      decryptor.decrypt(
        savedCipherText,
        Plain_C
      )

      const decodedVal = batchEncoder.decode(Plain_C)
      console.log("loadCipher", decodedVal);
    });

    return Plain_C;


  } catch (error) {
    console.error('Error: ', error);
  }
}

