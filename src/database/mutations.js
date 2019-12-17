import gql from "graphql-tag";

export const ADD_USER = gql`
  mutation add_user(
    $first_name: String!
    $last_name: String!
    $address: String!
    $phone_number: String
    $email: String
    $user_type: Int!
  ) {
    insert_users_data(
      objects: {
        first_name: $first_name
        last_name: $last_name
        address: $address
        phone_number: $phone_number
        email: $email
        user_type: $user_type
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_USER = gql`
  mutation update_user(
    $id: Int!
    $first_name: String!
    $last_name: String!
    $address: String!
    $phone_number: String
    $email: String
    $user_type: Int!
  ) {
    update_users_data(
      where: { id: { _eq: $id } }
      _set: {
        first_name: $first_name
        last_name: $last_name
        address: $address
        phone_number: $phone_number
        email: $email
        user_type: $user_type
      }
    ) {
      returning {
        first_name
        last_name
        address
        phone_number
        email
        R_user_type {
          id
          name
        }
        created_at
        updated_at
      }
    }
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation update_user_status($id: Int!, $newStatus: Int!) {
    update_users_data(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
    }
  }
`;
