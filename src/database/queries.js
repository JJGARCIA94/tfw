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
          { address: { _ilike: $search } }
          { phone_number: { _ilike: $search } }
          { email: { _ilike: $search } }
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

export const GET_USER_TYPE_VALIDATION = gql`
  subscription get_user_type_by_id_validation($userTypeId: Int!) {
    users_type_aggregate(
      where: { id: { _eq: $userTypeId }, _and: { status: { _eq: 1 } } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_USER_BY_USER_TYPE = gql`
  subscription get_user_by_user_type($userTypeId: Int!) {
    users_data_aggregate(
      where: { user_type: { _eq: $userTypeId }, _and: { status: { _eq: 1 } } }
    ) {
      aggregate {
        count
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

export const GET_CLASSES_PRICE_BY_STATUS = gql`
  subscription get_classes_price_by_status {
    classes_price(where: { status: { _eq: 1 } }, order_by: { id: desc }) {
      id
      name
      status
      created_at
      updated_at
      R_classes_price_details(where: { status: { _eq: 1 } }) {
        id
        classes_id
        status
        created_at
        updated_at
        R_classes {
          name
        }
      }
      R_classes_price_payment_periods(where: { status: { _eq: 1 } }) {
        persons
        total
        status
        specifications
        R_payment_period {
          id
          period
        }
      }
    }
  }
`;

export const GET_CLASSES_PRICE_PAYMENT_PERIOD_BY_CLASSES_PRICE_ID = gql`
  subscription get_classes_price_payment_period_by_classes_price_id(
    $classesPriceId: Int!
  ) {
    classes_price_payment_period(
      where: {
        classes_price_id: { _eq: $classesPriceId }
        _and: { status: { _eq: 1 } }
      }
    ) {
      id
      payment_period_id
      R_payment_period {
        period
        days
      }
      persons
      total
      specifications
    }
  }
`;

export const GET_USER_NAME_BY_USER_ID = gql`
  query get_user_name_by_user_id($userid: Int!) {
    users_data(where: { id: { _eq: $userid } }) {
      first_name
      last_name
    }
  }
`;

export const GET_USER_TYPES_ALL = gql`
  subscription get_user_types {
    users_type {
      id
      name
      status
    }
  }
`;

export const GET_USER_TYPE_BY_ID = gql`
  subscription get_user_type_by_id($userTypeId: Int!) {
    users_type(where: { id: { _eq: $userTypeId } }) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const GET_PAYMENT_PERIODS_ALL = gql`
  subscription get_payment_periods_all {
    payment_periods(order_by: { id: desc }) {
      id
      period
      days
      status
    }
  }
`;

export const GET_PAYMENT_PERIOD_BY_ID = gql`
  subscription gey_payment_period_by_id($paymentPeriodId: Int!) {
    payment_periods(where: { id: { _eq: $paymentPeriodId } }) {
      period
      days
      created_at
      updated_at
    }
  }
`;

export const GET_CLASSES_PRICE_PAYMENT_PERIOD_BY_PAYMENT_PERIOD = gql`
  subscription get_classes_price_payment_period_by_payment_period(
    $paymentPeriodId: Int!
  ) {
    classes_price_payment_period_aggregate(
      where: {
        payment_period_id: { _eq: $paymentPeriodId }
        _and: { status: { _eq: 1 } }
      }
    ) {
      aggregate {
        count
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
        status
        R_user_type {
          id
          name
        }
      }
      R_classes_details_aggregate(
        where: {
          R_users_data: { status: { _eq: 1 } }
          _and: { status: { _eq: 1 } }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_COACHES = gql`
  subscription get_coaches {
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
        _and: { R_users_data: { status: { _eq: 1 } }, status: { _eq: 1 } }
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

export const GET_MEMBERS_BY_CLASS_HISTORY = gql`
  subscription get_members_by_class($classId: Int!) {
    classes_details(
      where: { class_id: { _eq: $classId }, _and: { status: { _eq: 0 } } }
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
  subscription get_class($classId: Int!) {
    classes(where: { id: { _eq: $classId } }) {
      name
      description
      R_users_data {
        id
        status
      }
      created_at
      updated_at
    }
  }
`;

export const GET_CLASSES_PRICE = gql`
  subscription get_classes_price {
    classes_price(order_by: { id: desc }) {
      id
      name
      status
      created_at
      updated_at
      R_classes_price_details(where: { status: { _eq: 1 } }) {
        id
        classes_id
        status
        created_at
        updated_at
        R_classes {
          name
        }
      }
      R_classes_price_payment_periods(where: { status: { _eq: 1 } }) {
        persons
        total
        status
        specifications
        R_payment_period {
          id
          period
        }
      }
    }
  }
`;

export const GET_PAYMENT_PERIODS = gql`
  subscription get_payment_periods {
    payment_periods(where: { status: { _eq: 1 } }) {
      id
      period
    }
  }
`;

export const GET_CLASSES_ALL = gql`
  subscription get_classes_all {
    classes(where: { status: { _eq: 1 } }) {
      id
      name
    }
  }
`;

export const GET_CLASSES_BY_CLASS_PRICE_ID = gql`
  subscription get_classes_by_class_price_id($classPriceId: Int!) {
    classes_price_details(
      where: { classes_price_id: { _eq: $classPriceId } }
      order_by: { id: desc }
    ) {
      id
      status
      classes_id
      R_classes {
        name
      }
    }
  }
`;

export const GET_CLASSES_PRICE_DETAILS_COUNT_BY_CLASS_PRICE_ID = gql`
  subscription get_classes_price_details_count_by_class_price_id(
    $classPriceId: Int!
  ) {
    classes_price_details_aggregate(
      where: {
        classes_price_id: { _eq: $classPriceId }
        _and: { status: { _eq: 1 } }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_CLASSES_NOT_IN_BY_CLASS_ID = gql`
  subscription get_classes_not_in_by_class_id($idClasses: [Int!]) {
    classes(where: { id: { _nin: $idClasses }, _and: { status: { _eq: 1 } } }) {
      id
      name
    }
  }
`;

export const GET_PAYMENTS_BY_CLASS_PRICE_ID = gql`
  subscription get_payments_by_class_price_id($classPriceId: Int!) {
    classes_price_payment_period(
      where: { classes_price_id: { _eq: $classPriceId } }
      order_by: { id: desc }
    ) {
      id
      status
      payment_period_id
      persons
      total
      specifications
      R_payment_period {
        period
        days
      }
    }
  }
`;

export const GET_PAYMENTS_COUNT_BY_CLASS_PRICE_ID = gql`
  subscription get_payments_count_by_class_price_id($classPriceId: Int!) {
    classes_price_payment_period_aggregate(
      where: {
        classes_price_id: { _eq: $classPriceId }
        _and: { status: { _eq: 1 } }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_PAYMENT_PERIOD_BY_ID_VALIDATION = gql`
  subscription get_payment_period_by_id_validation($paymentPeriodId: Int!) {
    payment_periods_aggregate(
      where: { id: { _eq: $paymentPeriodId }, _and: { status: { _eq: 1 } } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_LOCKERS_ALL = gql`
  subscription get_lockers_all {
    lockers(order_by: { number: asc }) {
      id
      number
      created_at
      updated_at
      R_lockers_details(where: { status: { _eq: 1 } }) {
        id
        R_users_data {
          id
          first_name
          last_name
          address
          phone_number
          email
        }
      }
      status
    }
  }
`;

export const GET_ACTIVE_USERS = gql`
  subscription get_users($search: String!) {
    users_data(
      where: {
        _or: [
          { first_name: { _ilike: $search } }
          { last_name: { _ilike: $search } }
          { address: { _ilike: $search } }
          { phone_number: { _ilike: $search } }
          { email: { _ilike: $search } }
        ]
        _and: { status: { _eq: 1 } }
      }
      order_by: { first_name: asc, last_name: asc }
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

export const GET_LOCKER_DETAIL_BY_LOCKER_ID = gql`
  subscription get_locker_details_by_locker_id($lockerId: Int!) {
    lockers_details(
      where: { locker_id: { _eq: $lockerId }, _and: { status: { _eq: 1 } } }
    ) {
      locker_detail_id: id
      locker_id
      user_id
      R_users_data {
        first_name
        last_name
        address
        phone_number
        email
        R_user_type {
          name
        }
      }
    }
  }
`;

export const GET_LOCKER_IF_EXIST_BY_ID = gql`
  subscription get_locker_if_exist_by_id($lockerId: Int!) {
    lockers(where: { id: { _eq: $lockerId } }) {
      status
    }
  }
`;

export const GET_LOCKER_HISTORY = gql`
  subscription get_locker_history($lockerId: Int!) {
    lockers_details(
      where: { locker_id: { _eq: $lockerId } }
      order_by: { id: desc }
    ) {
      created_at
      updated_at
      status
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

export const GET_LOCKERS_SETTINGS = gql`
  subscription get_lockers_settings {
    lockers_settings {
      id
      price
      created_at
      updated_at
    }
  }
`;
