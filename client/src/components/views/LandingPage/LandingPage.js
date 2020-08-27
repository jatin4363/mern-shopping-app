import React, { useState, useEffect } from "react";
import Axios from "axios";
import { RocketOutlined } from "@ant-design/icons";
import { Col, Card, Row } from "antd";
import CheckBox from "./Sections/CheckBox";
import RadioBox from "./Sections/RadioBox";
import ImageSlider from "../../utils/ImageSlider";
import { continents, price } from "./Sections/Datas";

const { Meta } = Card;

function LandingPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(); //when the postSie is 8 then only we show load more button
  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });
  useEffect(() => {
    const variables = {
      skip: Skip,
      limit: Limit,
    };
    getProducts(variables);
  }, []);

  function getProducts(variables) {
    //get all the products from the server making this post request
    Axios.post("/api/product/getProducts", variables).then((response) => {
      if (response.data.success) {
        if (variables.loadMore) {
          setProducts([...Products, ...response.data.products]); //setting the state to an array of all the products fetched
        } else {
          setProducts(response.data.products);
        }
        setPostSize(response.data.postSize);
      } else {
        alert("Failed to fetch the products !");
      }
    });
  }

  function onLoadMore() {
    let skip = Skip + Limit;

    const variables = {
      skip: skip,
      limit: Limit,
      loadMore: true,
    };
    getProducts(variables);
    setSkip(skip);
  }

  //function that will return a card for each product in the array Products
  const renderCards = Products.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24}>
        {/* making responsive for the variable window sizes */}
        <Card
          hoverable={true}
          cover={
            <a href={`/product/${product._id}`}>
              {" "}
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta title={product.title} description={`₹ ${product.price}`} />
        </Card>
      </Col>
    );
  });

  function handlePrice(value) {
    //we need this function in order to get range of real numbers corresponding to the filter selected
    const data = price;
    let array = [];

    for (let key in data) {
      // console.log("key", key);
      // console.log("value", value);
      if (data[key]._id === parseInt(value, 10)) {
        array = data[key].array;
      }
    }
    return array;
  }

  function handleFilters(filters, category) {
    // console.log(filters);

    const newFilters = { ...Filters };
    // console.log(newFilters);

    newFilters[category] = filters; //like newFilters[continents] = [2,3,5,1]

    if (category === "price") {
      let priceValues = handlePrice(filters);
      newFilters[category] = priceValues;
    }

    showFilteredResults(newFilters);
    setFilters(newFilters);
  }

  function showFilteredResults(filters) {
    const variables = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };
    //updated fikters are send to the server as a post request and the page is rendered again
    getProducts(variables);
    setSkip(0);
  }

  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2>
          {" "}
          Let's Travel Anywhere <RocketOutlined />{" "}
        </h2>
      </div>

      {/* Filter  */}

      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          <CheckBox
            list={continents}
            handleFilters={(filters) => handleFilters(filters, "continents")}
          />
        </Col>
        <Col lg={12} xs={24}>
          <RadioBox
            list={price}
            handleFilters={(filters) => handleFilters(filters, "price")}
          />
        </Col>
      </Row>

      {/* Search  */}

      {Products.length === 0 ? (
        <div
          style={{
            display: "flex",
            height: "300px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>No post yet...</h2>
        </div>
      ) : (
        <div>
          <Row gutter={[16, 16]}>{renderCards}</Row>
        </div>
      )}

      <br />
      <br />

      {PostSize >= Limit && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={onLoadMore}>Load More</button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
