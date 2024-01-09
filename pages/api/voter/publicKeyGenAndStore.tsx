// 'use client';
import axios from "axios";
import SEAL from 'node-seal'
// import { updateKey } from "./updatepubkey";
export default async function keyGen() {
    console.log("function called")
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
  
    // Get the SecretKey from the keyGenerator
    const secretkey = keyGenerator.secretKey()
    
    // Get the PublicKey from the keyGenerator
    const publickey = keyGenerator.createPublicKey().save()
        console.log("key generated")
  
    // Function to store the publickey
    async function updateElection(electionId,publickey) {
       

      
      // const pubkey=publickey
      console.log(electionId);
      await axios.post("./api/updatepubkey", {
          election_id: electionId,
          publickey: publickey,
      });

      alert("Election Updated!")
    }

    updateElection(1,publickey)

    const publicKey = {
      pubkey: publickey,
    }
    
  
  }