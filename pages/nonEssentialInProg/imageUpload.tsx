import type { NextPage } from 'next'
import React,{useState} from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  preview: {
    marginTop: 50,
    display: "flex",
    flexDirection: "column",
  },
  image: { maxWidth: 200, maxHeight: 200 },
  delete: {
    cursor: "pointer",
    padding: 15,
    background: "red",
    color: "white",
    border: "none",
  },
};

const imageUpload = () => {

    const [isLoading, setIsLoading] = React.useState(false);
    const inputFileRef = React.useRef<HTMLInputElement | null>(null);

    const [selectedImage, setSelectedImage] = useState();

    // This function will be triggered when the file field change
    const imageChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedImage(e.target.files[0]);
      }
    };

    // This function will be triggered when the "Remove This Image" button is clicked
    const removeSelectedImage = () => {
      setSelectedImage(null);
    };



    const handleOnClick = async (e: React.MouseEvent<HTMLInputElement>) => {

        /* Prevent form from submitting by default */
        e.preventDefault();

        /* If file is not selected, then show alert message */
        if (!inputFileRef.current?.files?.length) {
            alert('Please, select file you want to upload');
            return;
        }

        setIsLoading(true);

        /* Add files to FormData */
        const formData = new FormData();
        Object.values(inputFileRef.current.files).forEach(file => {
            formData.append('file', file);
        })

        /* Send request to our api route */
        const response = await fetch('/api/imgUpload', {
            method: 'POST',
            body: formData
        });

        const body = await response.json() as { status: 'ok' | 'fail', message: string };

        alert(body.message);

        if (body.status === 'ok') {
            inputFileRef.current.value = '';
            // Do some stuff on successfully upload
        } else {
            // Do some stuff on error
        }

        setIsLoading(false);
    };

    return (
        <form>
                <div >
              <input
                accept="image/*"
                type="file"
                name='myfile'
                onChange={imageChange}
                ref={inputFileRef}
              />

              {selectedImage && (
                <div >
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    style={styles.image}
                    alt="Thumb"
                  />
                  <button onClick={removeSelectedImage} style={styles.delete}>
                    Remove This Image
                  </button>
                  <div>
                <input type="submit" value="Upload" disabled={isLoading} onClick={handleOnClick} />
                {isLoading && ` Wait, please...`}
            </div>
                </div>
                
        )}
      </div>
           
        </form>
    )
}

export default imageUpload
