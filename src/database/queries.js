import gql from "graphql-tag";

export const GET_USERS_PAYMENTS_EXPIRED = gql`
  subscription get_user_payments_expired($now: date!) {
    users_payments(
      where: { status: { _eq: 1 }, payment_end: { _lte: $now } }
      order_by: { payment_end: asc }
    ) {
      userPaymentId: id
      payment_end
      R_users_data {
        first_name
        last_name
      }
      R_classes_price_payment_period {
        R_classes_price {
          R_classes_price_details {
            R_classes {
              name
            }
          }
        }
      }
    }
  }
`;

export const GER_USER_PAYMENTS_ALMOST_EXPIRED = gql`
  subscription get_user_payments_almost_expired(
    $now: date!
    $twoDaysMore: date!
  ) {
    users_payments(
      where: {
        status: { _eq: 1 }
        payment_end: { _gt: $now }
        _and: { payment_end: { _lte: $twoDaysMore } }
      }
      order_by: { payment_end: asc }
    ) {
      userPaymentId: id
      payment_end
      R_users_data {
        first_name
        last_name
        phone_number
        email
      }
      R_classes_price_payment_period {
        R_classes_price {
          R_classes_price_details {
            R_classes {
              name
            }
          }
        }
      }
    }
  }
`;

export const GET_USER_ASSISTS = gql`
  subscription get_user_assists(
    $firstWeekDay: date!
    $currentLastWeekDay: date!
  ) {
    user_assists(
      where: {
        created: { _gte: $firstWeekDay }
        _and: { created: { _lte: $currentLastWeekDay } }
      }
    ) {
      id
      created
      R_users_data {
        first_name
        last_name
      }
    }
  }
`;

export const GET_NEW_CLIENTS = gql`
  subscription get_new_clients(
    $firstWeekDay: date!
    $currentLastWeekDay: date!
  ) {
    users_data(
      where: {
        created: { _gte: $firstWeekDay }
        _and: { created: { _lte: $currentLastWeekDay }, user_type: { _eq: 2 } }
      }
    ) {
      id
      created
      first_name
      last_name
    }
  }
`;

export const GET_MEMBERS_CLASSES = gql`
  subscription get_classes_members {
    classes {
      name
      R_classes_details_aggregate(
        where: { R_users_data: { status: { _eq: 1 } }, status: { _eq: 1 } }
        distinct_on: user_id
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_USER = gql`
  query get_user($user: String!) {
    users(
      where: {
        user: { _eq: $user }
        status: { _eq: 1 }
        R_users_data: { user_type: { _eq: 1 } }
      }
    ) {
      id
      password
    }
  }
`;

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

export const GET_USER_BY_ID_AUTH = gql`
  query get_user_by_id_auth($id: Int!) {
    users(
      where: {
        id: { _eq: $id }
        status: { _eq: 1 }
        R_users_data: { user_type: { _eq: 1 } }
      }
    ) {
      id
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

export const GET_CLASSES_DETAILS_BY_USER_PAYMENTS_ID = gql`
  subscription get_classes_details_by_user_payments_id(
    $userPaymentId: bigint!
  ) {
    classes_details(where: { user_payment_id: { _eq: $userPaymentId } }) {
      class_id
      user_id
    }
  }
`;

export const GET_USER_NAME_BY_USER_ID = gql`
  subscription get_user_name_by_user_id($userid: Int!) {
    users_data(where: { id: { _eq: $userid } }) {
      first_name
      last_name
      status
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
        distinct_on: user_id
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_CLASSES_PRICE_BY_CLASS_ID = gql`
  subscription get_classes_price_by_class_id($classId: Int!) {
    classes_price_details(
      where: {
        classes_id: { _eq: $classId }
        status: { _eq: 1 }
        R_classes_price: { status: { _eq: 1 } }
      }
    ) {
      id
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
      distinct_on: user_id
    ) {
      id
      user_id
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
  subscription get_members_by_class($classId: Int!, $activeUsers: [Int!]) {
    classes_details(
      where: {
        class_id: { _eq: $classId }
        _and: { status: { _eq: 0 } }
        user_id: { _nin: $activeUsers }
      }
      distinct_on: user_id
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
          status
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

export const GET_LOCKER_PRICE = gql`
  subscription get_locker_price {
    lockers_settings {
      price
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
      cost
      payment_type
      payment_start
      payment_end
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

export const GET_USER_PAYMENTS_BY_USER_ID = gql`
  subscription get_user_payments_by_user_id($userId: Int!) {
    users_payments(
      where: { user_id: { _eq: $userId } }
      order_by: { payment_end: desc }
    ) {
      id
      discount_percent
      total
      status
      payment_start
      payment_end
      payment_type
      R_classes_price_payment_period {
        id
        payment_period_id
        R_payment_period {
          period
          days
        }
        R_classes_price {
          id
          R_classes_price_details(where: { status: { _eq: 1 } }) {
            id
            classes_id
            R_classes {
              name
            }
          }
        }
      }
    }
  }
`;

export const GET_ALL_USER_PAYMENTS_COUNTED_BY_DATE = gql`
  subscription get_all_user_payments_counted_by_date(
    $startDate: date!
    $endDate: date!
  ) {
    users_payments_aggregate(
      where: {
        payment_type: { _eq: 0 }
        payment_start: { _gte: $startDate }
        _and: { payment_start: { _lte: $endDate } }
      }
    ) {
      aggregate {
        sum {
          total
        }
      }
    }
  }
`;

export const GET_ALL_USER_PAYMENTS_CREDIT_BY_DATE = gql`
  subscription get_all_user_payments_credit_by_date(
    $startDate: date!
    $endDate: date!
  ) {
    users_payments_aggregate(
      where: {
        payment_type: { _eq: 1 }
        payment_start: { _gte: $startDate }
        _and: { payment_start: { _lte: $endDate } }
      }
    ) {
      aggregate {
        sum {
          total
        }
      }
    }
  }
`;

export const GET_ALL_LOCKER_PAYMENTS_COUNTED_BY_DATE = gql`
  subscription get_all_lockers_payments_counted_by_date(
    $startDate: date!
    $endDate: date!
  ) {
    lockers_details_aggregate(
      where: {
        payment_type: { _eq: 0 }
        payment_start: { _gte: $startDate }
        _and: { payment_start: { _lte: $endDate } }
      }
    ) {
      aggregate {
        sum {
          cost
        }
      }
    }
  }
`;

export const GET_ALL_LOCKER_PAYMENTS_CREDIT_BY_DATE = gql`
  subscription get_all_lockers_payments_credit_by_date(
    $startDate: date!
    $endDate: date!
  ) {
    lockers_details_aggregate(
      where: {
        payment_type: { _eq: 1 }
        payment_start: { _gte: $startDate }
        _and: { payment_start: { _lte: $endDate } }
      }
    ) {
      aggregate {
        sum {
          cost
        }
      }
    }
  }
`;
