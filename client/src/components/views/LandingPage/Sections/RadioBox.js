import React, { useState } from "react";
import { Collapse, Radio } from "antd";
const { Panel } = Collapse;

function RadioBox(props) {
  const [Value, setValue] = useState(0);

  function renderRadioBox() {
    return (
      props.list &&
      props.list.map((value) => (
        <Radio key={value._id} value={`${value._id}`}>
          {value.name}
        </Radio>
      ))
    );
  }

  function handleChange(event) {
    setValue(event.target.value);
    props.handleFilters(event.target.value);
  }

  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Price" key="1">
          <Radio.Group onChange={handleChange} value={Value}>
            {renderRadioBox()}
          </Radio.Group>
        </Panel>
      </Collapse>
    </div>
  );
}

export default RadioBox;
