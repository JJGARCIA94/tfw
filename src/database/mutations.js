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

export const UPDATE_USER_TYPE_STATUS = gql`
  mutation update_user_type_status($id: Int!, $newStatus: Int!) {
    update_users_type(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
    }
  }
`;

export const ADD_USER_TYPE = gql`
  mutation add_user_type($name: String!) {
    insert_users_type(objects: { name: $name }) {
      affected_rows
    }
  }
`;

export const UPDATE_USER_TYPE = gql`
  mutation update_user_type($userTypeId: Int!, $name: String!) {
    update_users_type(
      where: { id: { _eq: $userTypeId } }
      _set: { name: $name }
    ) {
      returning {
        created_at
        updated_at
        name
      }
    }
  }
`;

export const ADD_CLASS = gql`
  mutation add_class($name: String!, $description: String!, $idCoach: Int!) {
    insert_classes(
      objects: { name: $name, description: $description, user_id: $idCoach }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CLASS = gql`
  mutation update_class(
    $classId: Int!
    $name: String!
    $description: String!
    $idCoach: Int!
  ) {
    update_classes(
      where: { id: { _eq: $classId } }
      _set: { name: $name, description: $description, user_id: $idCoach }
    ) {
      returning {
        name
        description
        R_users_data {
          id
        }
        created_at
        updated_at
      }
    }
  }
`;

export const CANCEL_CLASS = gql`
  mutation cancel_class($classId: Int!) {
    update_classes(where: { id: { _eq: $classId } }, _set: { status: 0 }) {
      affected_rows
    }
    update_classes_details(
      where: { class_id: { _eq: $classId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
  }
`;

export const RESTORE_CLASS = gql`
  mutation restore_class($classId: Int!) {
    update_classes(where: { id: { _eq: $classId } }, _set: { status: 1 }) {
      affected_rows
    }
  }
`;
