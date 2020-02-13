import React, { useEffect } from "react";
import { TextField } from "@material-ui/core";

export default function SearchInput(props) {
  const { label, search, setSearch, setHandle } = props;
  
  useEffect(() => {
    document.getElementById("textFieldSearch").focus();
  });

  return (
    <TextField
      label={label}
      margin="normal"
      style={{width: "100%"}}
      id="textFieldSearch"
      value={search}
      onChange={e => {
        setSearch(e.target.value);
        setHandle(false);
      }}
    />
  );
}
