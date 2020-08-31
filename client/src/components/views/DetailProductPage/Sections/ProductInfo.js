import React, { useState, useEffect } from "react";
import { Button, Descriptions } from "antd";

function ProductInfo(props) {
  const [Product, setProduct] = useState({});

  useEffect(() => {
    setProduct(props.detail);
  }, [props.detail]);

  function addToCartHandler() {
    // we need to send the product id to the parent page that is detailProductInfo page
    props.addToCart(props.detail._id);
  }

  return (
    <div>
      <Descriptions title="Product Info">
        <Descriptions.Item label="Price"> {Product.price}</Descriptions.Item>
        <Descriptions.Item label="Sold">{Product.sold}</Descriptions.Item>
        <Descriptions.Item label="View"> {Product.views}</Descriptions.Item> 
        <Descriptions.Item label="Description">
          {" "}
          {Product.description}
        </Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          size="large"
          shape="round"
          type="danger"
          onClick={addToCartHandler}
        >
          Add to Cart
        </Button>
        {/* this button when clicked the addToCartHandler is called which sends the product is to the views/detailProductPage
        where the function addToCartHandler sends using redux dispatch and goes to user_actions.js to call addToCart funciton
        this addToCart function in the _actions/users_action makes a post request with productId in the params and the control is then 
        transferred to routes/users.js */}
      </div>
    </div>
  );
}

export default ProductInfo;
