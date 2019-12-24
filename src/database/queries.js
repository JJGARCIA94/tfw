import gql from "graphql-tag";

export const GET_USER_TYPES = gql`
  subscription get_user_types {
    users_type(where: { status: { _eq: 1 } }) {
      id
      name
    }
  }
`;

export const GET_USERS_BY_NAME = gql`
  subscription get_users($search: String, $userType: Int) {
    users_data(
      where: {
        _or: [
          { first_name: { _ilike: $search } }
          { last_name: { _ilike: $search } }
        ]
        _and: { user_type: { _eq: $userType } }
      }
    ) {
      id
      first_name
      last_name
      email
      address
      user_type
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
  subscription get_user_by_id($id: Int!) {
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
    users_data(where: { id: { _eq: $userId } }) {
      first_name
      last_name
      user_type
      R_user_assists_aggregate {
        aggregate {
          count
        }
        nodes {
          id
          entry
        }
      }
    }
  }
`;

export const GET_CLASSES = gql`
  subscription get_classes {
    classes(order_by: { id: desc }) {
      id
      name
      description
      status
      R_users_data {
        id
        first_name
        last_name
        address
        phone_number
        email
        R_user_type {
          id
          name
        }
      }
      R_classes_details_aggregate(
        where: { R_users_data: { status: { _eq: 1 } } }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_COACHES = gql`
  query get_coaches {
    users_data(where: { user_type: { _eq: 3 }, _and: { status: { _eq: 1 } } }) {
      id
      first_name
      last_name
      address
      phone_number
      email
    }
  }
`;

export const GET_MEMBERS_BY_CLASS = gql`
  subscription get_members_by_class($classId: Int!) {
    classes_details(
      where: {
        class_id: { _eq: $classId }
        _and: { R_users_data: { status: { _eq: 1 } } }
      }
    ) {
      id
      R_users_data {
        first_name
        last_name
        address
        phone_number
        email
      }
    }
  }
`;

export const GET_CLASS = gql`
  query get_class($classId: Int!) {
    classes(where: { id: { _eq: $classId } }) {
      id
      name
      description
      R_users_data {
        id
      }
      created_at
      updated_at
    }
  }
`;
