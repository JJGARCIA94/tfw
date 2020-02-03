import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { Container } from "@material-ui/core";
import { useQuery} from "@apollo/react-hooks";
import {
  GET_USER_BY_ID_AUTH
} from "../../database/queries";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

export default function Home(props) {
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const { data: userAuthData, error: userAuthError } = useQuery(
    GET_USER_BY_ID_AUTH,
    {
      variables: {
        id: userIdAuth
      },
      onCompleted: () => {
        if (userAuthData.users.length === 0 && userIdAuth !== 0) {
          localStorage.removeItem("token");
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      }
    }
  );

  useEffect(() => {
    function isUserAuth() {
      try {
        if (localStorage.getItem("token")) {
          const decodedToken = jwt.verify(
            localStorage.getItem("token"),
            "mysecretpassword"
          );
          setUserIdAuth(decodedToken.id);
        } else {
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUserAuth(false);
        setUserAuthHeader(false);
      }
    }

    isUserAuth();
  });

  if (userAuthError) {
    return <NotFound />;
  }

  return ( userAuth ?
    <div>
      <Container maxWidth="lg">
        <h1>Home</h1>
      </Container>
    </div> : <Redirect to="/login" />
  );
}
