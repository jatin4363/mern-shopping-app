import React, { useState } from "react";
import { Typography, Button, Form, Input } from "antd";
import FileUpload from "../../utils/FileUpload";
import Axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

const Continents = [
  { key: 1, value: "Asia" },
  { key: 2, value: "Europe" },
  { key: 3, value: "Africa" },
  { key: 4, value: "North America" },
  { key: 5, value: "South America" },
  { key: 6, value: "Australia" },
  { key: 7, value: "Antarctica" },
];

function UploadProductPage(props) {
  const [TitleValue, setTitleValue] = useState("");
  const [DescriptionValue, setDesciptionValue] = useState("");
  const [PriceValue, setPriceValue] = useState(0);
  const [ContinentValue, setContinentValue] = useState(1);
  const [Images, setImages] = useState([]);

  function onTitleChange(event) {
    setTitleValue(event.currentTarget.value);
  }

  function onDescriptionChange(event) {
    setDesciptionValue(event.currentTarget.value);
  }

  function onPriceChange(event) {
    setPriceValue(event.currentTarget.value);
  }

  function onContinentselectChange(event) {
    setContinentValue(event.currentTarget.key);
  }

  function updateImages(newImages) {
    setImages(newImages);
  }

  function onSubmit(event) {
    event.preventDefault();
    const variables = {
      writer: props.user.userData._id,
      title: TitleValue,
      description: DescriptionValue,
      price: PriceValue,
      images: Images,
      continents: ContinentValue,
    };
    Axios.post("/api/product/uploadProduct", variables).then((response) => {
      if (response.data.success) {
        alert("Product Successfully Uploaded");
        props.history.push("/");
      } else {
        alert("Failed to upload Product");
      }
    });
  }

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Title level={2}>Upload Product Page</Title>
      </div>

      <Form onSubmit={onSubmit}>
        <FileUpload refreshFunction={updateImages} />

        <label>Title</label>
        <Input onChange={onTitleChange} value={TitleValue} />

        <br />
        <br />

        <label>Description</label>
        <TextArea onChange={onDescriptionChange} value={DescriptionValue} />

        <br />
        <br />

        <label>Price (₹)</label>
        <Input onChange={onPriceChange} value={PriceValue} type="number" />

        <br />
        <br />

        <select onChange={onContinentselectChange}>
          {Continents.map((continent) => (
            <option key={continent.key} value={continent.key}>
              {continent.value}
            </option>
          ))}
        </select>

        <br />
        <br />

        <Button onClick={onSubmit}>Submit</Button>
      </Form>
    </div>
  );
}

export default UploadProductPage;
