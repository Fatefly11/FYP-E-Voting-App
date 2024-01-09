// 'use client';
// import SEAL from 'node-seal'
// export const SEAL = require('node-seal')
export default async function fhetest() {
    // Pick one for your environment
    // npm install node-seal
    // yarn add node-seal
    //
    // ES6 or CommonJS
    // import SEAL from 'node-seal'
    const SEAL = require('node-seal')

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
    return context
}




// Functions start here
export function keygen(seal, context) {
   
    const keyGenerator = seal.KeyGenerator(context)
    
      // Get the SecretKey from the keyGenerator
      const secretkey = keyGenerator.secretKey()
      
     
      // Get the PublicKey from the keyGenerator
      const publickey = keyGenerator.createPublicKey()

      return [secretkey, publickey]
}

export function encode(seal, context, intArray) {
    const plaintext = seal.PlainText()
    seal.BatchEncoder(context).encode(
        Uint32Array.from(intArray),
        plaintext
      )
      return plaintext
}

export function decode(seal, context, intArray) {
    const plaintext = seal.PlainText()
    seal.BatchEncoder(context).decode(
        Uint32Array.from(intArray),
        plaintext
      )
      return plaintext
}

export function encrypt(seal, context, publickey, plaintext) {
    const encryptor = seal.Encryptor(
        context,
        publickey
      )
    const ciphertext = seal.CipherText()
    encryptor.encrypt(
        plaintext,
        ciphertext
    )  
    return ciphertext
}

export function decrypt(seal, context, secretkey, ciphertext) {
    const decryptor = seal.Decryptor(
        context,
        secretkey
      )
    const plaintext = seal.PlainText()
    decryptor.decrypt(
        ciphertext,
        plaintext
      )
    return plaintext
}

export function add(seal, context, ciphertext1, ciphertext2) {
    const evaluator = seal.Evaluator(context)
    const ciphertextResult = seal.CipherText()
    evaluator.add(
        ciphertext1,
        ciphertext2,
        ciphertextResult
      )
    return ciphertextResult
}