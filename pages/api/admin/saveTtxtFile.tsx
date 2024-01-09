// pages/api/saveBase64AsTxtFile.ts
// import { promises as fs } from "fs";

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get the base64 data from the request body
      const { base64Data } = req.body;

      // Convert the base64 data to a buffer
      const fs = require('fs');
      const buffer = Buffer.from(base64Data, 'base64');

      // Write the buffer to a file on the server (adjust the file path as needed)
      const filePath = '../../public/uploads/base64.txt';
      fs.writeFileSync(filePath, buffer);

      // Return a success response
      return res.status(200).json({ message: 'File saved successfully!' });
    } catch (error) {
      console.error('Error saving file:', error);
      return res.status(500).json({ message: 'Error saving file.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
}

export async function saveBase64AsTxtFile(base64Data: string) {
  try {
    // Send a POST request to the API route to save the file
    const response = await fetch('/api/savetxtfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Data }),
    });

    if (response.ok) {
      console.log('File saved successfully!');
    } else {
      console.error('Error saving file:', await response.text());
    }
  } catch (error) {
    console.error('Error saving file:', error);
  }
}
