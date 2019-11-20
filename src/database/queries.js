import gql from 'graphql-tag';

export const GET_USER_TYPES = gql`
    query get_user_types {
        users_type(where: {status: {_eq: 1}}) {
            id
            name
        }
    }
`;