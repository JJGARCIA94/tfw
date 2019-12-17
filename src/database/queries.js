import gql from "graphql-tag";

export const GET_USER_TYPES = gql`
  query get_user_types {
    users_type(where: { status: { _eq: 1 } }) {
      id
      name
    }
  }
`;

export const GET_USERS_BY_NAME = gql`
  subscription get_users($search: String) {
    users_data(
      where: {
        _or: [
          { first_name: { _ilike: $search } }
          { last_name: { _ilike: $search } }
        ]
      }
    ) {
      id
      first_name
      last_name
      email
      address
      phone_number
      R_user_type {
        id
        name
      }
      status
    }
  }
`;

export const GET_USERS = gql`
  query get_users($search: String) {
    users_data {
      id
      first_name
      last_name
      email
      address
      phone_number
      R_user_type {
        id
        name
      }
      status
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query get_user_by_id($id: Int!) {
    users_data(where: { id: { _eq: $id } }) {
      first_name
      last_name
      address
      phone_number
      email
      status
      created_at
      updated_at
      R_user_type {
        id
        name
      }
    }
  }
`;

export const GET_ASSISTS_BY_USER = gql`
  query get_assists_by_user($userId: Int!) {
    users_data(where: {id: {_eq: $userId}}) {
    first_name
    last_name
    user_type
    R_user_assists_aggregate{
      aggregate{
        count
      }
      nodes{
        id
      entry
      }
    }
  }
}
`;
