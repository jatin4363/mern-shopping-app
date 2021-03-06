import React, { useState } from "react";
import { Checkbox, Collapse } from "antd";

const { Panel } = Collapse;

function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  function handleToggle(value) {
    const currentIndex = Checked.indexOf(value);
    const newChecked = [...Checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    }
    //-1 means the checkbox is unchecked and not in the list thus we push it if not in the list
    else {
      newChecked.splice(currentIndex, 1);
    }
    // if it is present we remove it frm the list and thus toggle the change

    setChecked(newChecked);

    props.handleFilters(newChecked);
  }

  function renderCheckboxLists() {
    return (
      props.list &&
      props.list.map((value, index) => (
        <React.Fragment key={index}>
          <Checkbox
            onChange={() => handleToggle(value._id)}
            type="checkbox"
            checked={Checked.indexOf(value._id) === -1 ? false : true}
          />

          <span>{value.name}</span>
        </React.Fragment>
      ))
    );
  }

  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Continents" key="1">
          {renderCheckboxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
