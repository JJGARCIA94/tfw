import gql from 'graphql-tag';

export const GET_USER_TYPES = gql`
    query get_user_types {
        users_type(where: {status: {_eq: 1}}) {
            id
            name
        }
    }
`;

export const GET_USERS = gql`
    query get_users($search: String) {
  users_data(where: {
    _or: [
      {first_name: {_ilike: $search}},
      {last_name: {_ilike: $search}}
    ]
  }) {
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