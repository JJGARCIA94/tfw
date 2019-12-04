import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import {
  CircularProgress
} from "@material-ui/core";
import { Query } from "react-apollo";
import { GET_USER_TYPES } from "../../database/queries";
import { ADD_USER } from "../../database/mutations";

export default function NewUser() {
  const [userState, setUserState] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    email: "",
    user_type: 0
  });
  const [errorState, setErrorState] = useState(false);
  const [redirectState, setRedirectState] = useState(false);
  const [
    addUserMutation,
    { loading: loadingAddUserMutation, error: errorAddUserMutation }
  ] = useMutation(ADD_USER);

  const getUserTypes = () => {
    return (
      <Query query={GET_USER_TYPES}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return console.log(error);
          if (data.users_type.length) {
            return data.users_type.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ));
          } else {
            return (
              <option value="0">No hay tipos de usuarios para mostrar</option>
            );
          }
        }}
      </Query>
    );
  };

  const addUser = async () => {
    const {
      first_name,
      last_name,
      address,
      phone_number,
      email,
      user_type
    } = userState;
    if (
      first_name === "" ||
      last_name === "" ||
      address === "" ||
      phone_number === "" ||
      email === "" ||
      user_type === 0
    ) {
      setErrorState(true);
      return;
    }

    addUserMutation({
      variables: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address: address.trim(),
        phone_number: phone_number.trim(),
        email: email.trim(),
        user_type: user_type
      }
    });

    if (loadingAddUserMutation) return <CircularProgress />;
    if (errorAddUserMutation) return <p>An error occurred</p>;
    setRedirectState(true);
  };

  let response = errorState ? <p>All fields are requireds</p> : <p></p>;

  return (
    <div className="container" style={{background: "#FFFFFF"}}>
      {response}
      <h2 className="text-center">Add User</h2>
      
        <div className="col-12 col-sm-12 col-md-6 col-xl-6">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="first_name"
              placeholder="name@example.com"
              value={userState.first_name}
              onChange={e => {
                setUserState({
                  ...userState,
                  first_name: e.target.value
                });
              }}
            />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-6 col-xl-6">
          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="last_name"
              placeholder="name@example.com"
              value={userState.last_name}
              onChange={e => {
                setUserState({
                  ...userState,
                  last_name: e.target.value
                });
              }}
            />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-8 col-xl-8">
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="address"
              placeholder="name@example.com"
              value={userState.address}
              onChange={e => {
                setUserState({
                  ...userState,
                  address: e.target.value
                });
              }}
            />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-8 col-xl-8">
          <div className="form-group">
            <label htmlFor="phone_number">Phone number *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="phone_number"
              placeholder="name@example.com"
              value={userState.phone_number}
              onChange={e => {
                setUserState({
                  ...userState,
                  phone_number: e.target.value
                });
              }}
            />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-8 col-xl-8">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="email"
              placeholder="name@example.com"
              value={userState.email}
              onChange={e => {
                setUserState({
                  ...userState,
                  email: e.target.value
                });
              }}
            />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-8 col-xl-8">
          <div className="form-group">
            <label htmlFor="user_type">User Type *</label>
            <select
              id="user_type"
              className="form-control form-control-lg"
              value={userState.user_type}
              onChange={e => {
                setUserState({
                  ...userState,
                  user_type: e.target.value
                });
              }}
            >
              <option value="0">Select a user type</option>
              {getUserTypes()}
            </select>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-8 col-xl-8">
        <div className="form-group">
          <button
            className="btn btn-primary btn-lg"
            style={{ float: "right" }}
            onClick={() => {
              addUser();
            }}
          >
            Save
          </button>
          </div>
        </div>
      {redirectState ? <Redirect to="/" /> : null}
    </div>
  );
}
