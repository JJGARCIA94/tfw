import React, { useEffect } from "react";
import { TextField } from "@material-ui/core";

export default function SearchInput(props) {
  useEffect(() => {
    document.getElementById("textFieldSearch").focus();
  });

  return (
    <TextField
      label={props.label}
      margin="normal"
      id="textFieldSearch"
      value={props.search}
      onChange={e => {
        props.setSearch(e.target.value);
      }}
    />
  );
}
