import prisma from "../../../lib/prisma";
import SEAL from 'node-seal'

// function to fetch the votes data of the ballot, required for tallying
export async function fetchVotes(ballotId) {
  try {
    // Use Prisma Client to fetch votes data of the ballot
    const votesData = await prisma.vote.findMany({
      
      select: {
        vote_data: true
      },
      where: {
        ballot_id: ballotId
      },
    });
    
    return votesData;

  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

// function to fetch public key of the ballot, required for tallying
export async function fetchPublicKey(ballotId) {
  try {
    // Use Prisma Client to fetch votes data of the ballot
    const electionId = await prisma.ballot.findFirst({
      
      select: {
        election_id: true
      },
      where: {
        ballot_id: ballotId
      },
    });
    
    
    const publicKey = await prisma.election.findFirst({
      
      select: {
        public_key: true
      },
      where: {
        election_id: electionId.election_id
      },
    });
    return publicKey.public_key;
    

  } catch (err) {
    console.error("Error executing Prisma query:", err);
    throw err;
  }
}

export default async function tallyVotes(ballotId) {
    // fetch the votes data
    const votesData= await fetchVotes(ballotId);
    const publicKey= await fetchPublicKey(ballotId);

    // initialize node-seal instance to initialize the ciphertext 
    //and the evaluator for ciphertext on ciphertext addition
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
		


    // Create a BatchEncoder (only bfv/bgv SchemeType)
		const batchEncoder = seal.BatchEncoder(context)
    const loadedPublicKey=seal.PublicKey()
    loadedPublicKey.load(context, publicKey)
		// Create an Encryptor
		 const encryptor = seal.Encryptor(
			context,
			loadedPublicKey
		  )


    //////////////////////////////////////
		// Create an empty tally ciphertext
		/////////////////////////////////////


		// Encode data to a PlainText
      const plaintext=seal.PlainText()
		  batchEncoder.encode(
			Int32Array.from([0]),
			plaintext
		  )
		// Encrypt a PlainText
    const ciphertext=seal.CipherText()
		  encryptor.encrypt(
			plaintext,
			ciphertext
		  )    
      
    const evaluator= seal.Evaluator(context)
    const cipherTextX = seal.CipherText()
    let cipherArray=  []
    
    // change the base64 string of votes data into ciphertext
    function b64ToCipherText(item){
      cipherTextX.load(context, item.vote_data)
      cipherArray.push(cipherTextX.save())
    }

    votesData.forEach(b64ToCipherText)
    // console.log(cipherArray)


    // tally the votes data
    function tally(cipherX){

      const cipherTextX = seal.CipherText()
      cipherTextX.load(context, cipherX)

      // add the ciphertext to the tally
      evaluator.add(ciphertext, cipherTextX, ciphertext)
    }
    cipherArray.forEach(tally)
    // console.log(cipherTextSum)
    // //return the tally result

		

    return ciphertext.save()
}
 