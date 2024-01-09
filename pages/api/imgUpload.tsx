import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import { File } from "formidable";

const formidable = require("formidable");

/* Don't miss that! */
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFiles = Array<[string, File]>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let status = 200,
    resultBody = { status: "ok", message: "Files were uploaded successfully" };

  /* Get files using formidable */
  const files = await new Promise<ProcessedFiles | undefined>(
    (resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.maxFileSize = 1 * 1024 * 1024; // 5 MB
      
        
      
      const files: ProcessedFiles = [];
      form.on("file", function (field, file) {
        files.push([field, file]);
      });
      form.on("end", () => resolve(files));
      form.on("error", (err) => reject(err));
      form.parse(req, () => {
        //
      });
    }
  ).catch((e) => {
    console.log(e);
    status = 500;
    resultBody = {
      status: "fail",
      message: "Upload error",
    };
  });
  if(files[0][1].size > 1 * 1024 * 1024) {
   
    resultBody = {
      status: "fail",
      message: "File size is too big",
    };
    
  }

  if (files) {
    if (files[0][1].size < 1 * 1024 * 1024) {
      /* Create directory for uploads */
      const targetPath = path.join(process.cwd(), `/public/candidatePicture/`);
      try {
        await fs.access(targetPath);
      } catch (e) {
        await fs.mkdir(targetPath);
      }
  
      /* Move uploaded files to directory */
      
      for (const file of files) {
        
        const tempPath = file[1].filepath;
        await fs.rename(tempPath, targetPath + file[1].originalFilename);
      }
    
    } else{
      console.log("file rejected: size of "+(files[0][1].size / (1024*1024))+ " MB is too big")

    }
  }

  res.status(status).json(resultBody);
};

export default handler;
