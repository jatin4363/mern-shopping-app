import React, { useState } from "react";
import { Input } from "antd";

const { Search } = Input;

function SearchFeature(props) {
  const [SearchTerms, setSearchTerms] = useState("");
  function onChange(event) {
    setSearchTerms(event.currentTarget.value);
    props.refreshFunction(event.currentTarget.value);
  }
  return (
    <div>
      <Search
        value={SearchTerms}
        onChange={onChange}
        placeholder="Search by Typing ..."
      />
    </div>
  );
}

export default SearchFeature;
