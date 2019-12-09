import gql from 'graphql-tag';

export const ADD_USER = gql`
mutation add_client($first_name: String!, $last_name: String!, $address: String!, $phone_number: String, $email: String, $user_type: Int!) {
    insert_users_data(objects: {
      first_name: $first_name
      last_name: $last_name
      address: $address
      phone_number: $phone_number
      email: $email
      user_type: $user_type
    }) {
      affected_rows
    }
  }
`;