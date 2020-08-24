import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { PlusOutlined } from "@ant-design/icons";
import Axios from "axios";

function FileUpload(props) {
  const [Images, setImages] = useState([]);

  function onDrop(files) {
    //a way to easily construct a set of key/value pairs representing form fields and their values
    let formData = new FormData();
    const config = {
      header: { "content-type": "multipart/form-data" },
    };

    //add the file in the from with a key from frontend into the formdata object
    formData.append("file", files[0]);

    //   save it to the server at the backend
    Axios.post("/api/product/uploadImage", formData, config).then(
      (response) => {
        if (response.data.success) {
          // here we will get the info ,of the image stored, from the server/routes/products.js

          setImages([...Images, response.data.image]);
          props.refreshFunction([...Images, response.data.image]); //we pass this info to the parent UploadProductPage.js
        } else {
          alert("Failed to save the Image in Server");
        }
      }
    );
  }

  function onDelete(index) {
    let newImages = [...Images];
    newImages.splice(index, 1);
    setImages(newImages);
    props.refreshFunction(newImages);
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Dropzone onDrop={onDrop} multiple={false} maxSize={800000000}>
        {({ getRootProps, getInputProps }) => (
          <div
            style={{
              width: "300px",
              height: "240px",
              border: "1px solid lightgray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <PlusOutlined style={{ fontSize: "3rem" }} />
          </div>
        )}
      </Dropzone>

      <div
        style={{
          display: "flex",
          width: "350px",
          height: "240px",
          overflowX: "scroll",
        }}
      >
        {Images.map((image, index) => (
          <div onClick={() => onDelete(index)}>
            <img
              style={{ minWidth: "300px", width: "300px", height: "240px" }}
              src={`http://localhost:5000/${image}`}
              alt={`productImg-${index}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileUpload;
