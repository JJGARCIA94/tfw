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
    query get_users {
        users_data {
            id
            first_name
            last_name
            email
            adress
            phone_number
            R_user_type{
            id
            name
            }
        }
    }
`;