import gql from "graphql-tag";

export const UPDATE_USER_PAYMENT_STATUS = gql`
  mutation update_user_payment_status($userPaymentId: bigint!) {
    update_users_payments(
      where: { id: { _eq: $userPaymentId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
    update_classes_details(
      where: { user_payment_id: { _eq: $userPaymentId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
  }
`;

export const ADD_USER = gql`
  mutation add_user(
    $first_name: String!
    $last_name: String!
    $address: String!
    $phone_number: String
    $email: String
    $user_type: Int!
    $created: date!
  ) {
    insert_users_data(
      objects: {
        first_name: $first_name
        last_name: $last_name
        address: $address
        phone_number: $phone_number
        email: $email
        user_type: $user_type
        created: $created
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
    update_lockers_details(
      where: { user_id: { _eq: $id } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
    update_classes_details(
      where: { user_id: { _eq: $id } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
    update_users_payments(
      where: { user_id: { _eq: $id } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
  }
`;

export const ADD_USER_PAYMENT = gql`
  mutation add_user_payment(
    $userId: Int!
    $classesPricePaymentPeriodId: Int!
    $discountPercent: numeric!
    $total: numeric!
    $paymentStart: date!
    $paymentEnd: date!
  ) {
    insert_users_payments(
      objects: {
        user_id: $userId
        classes_price_payment_period_id: $classesPricePaymentPeriodId
        discount_percent: $discountPercent
        total: $total
        payment_start: $paymentStart
        payment_end: $paymentEnd
        R_classes_details: {
          data: [
            { class_id: 14, user_id: 96 }
            { class_id: 15, user_id: 96 }
            { class_id: 5, user_id: 96 }
          ]
        }
      }
    ) {
      returning {
        id
      }
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

export const ADD_PAYMENT_PERIOD = gql`
  mutation add_payment_period($period: String!, $days: Int!) {
    insert_payment_periods(objects: { period: $period, days: $days }) {
      affected_rows
    }
  }
`;

export const UPDATE_PAYMENT_PERIOD = gql`
  mutation update_payment_period(
    $paymentPeriodId: Int!
    $period: String!
    $days: Int!
  ) {
    update_payment_periods(
      where: { id: { _eq: $paymentPeriodId } }
      _set: { period: $period, days: $days }
    ) {
      returning {
        period
        days
        created_at
        updated_at
      }
    }
  }
`;

export const UPDATE_PAYMENT_PERIOD_STATUS = gql`
  mutation update_payment_period_status($id: Int!, $newStatus: Int!) {
    update_payment_periods(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
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

export const ADD_CLASS_PRICE = gql`
  mutation add_class_price(
    $specifications: String
    $total: numeric!
    $paymentPeriodId: Int!
    $persons: Int!
  ) {
    insert_classes_price(
      objects: {
        specifications: $specifications
        total: $total
        payment_period_id: $paymentPeriodId
        persons: $persons
      }
    ) {
      returning {
        id
      }
    }
  }
`;

/*export const ADD_CLASS_PRICE_DETAILS = gql`
  mutation add_class_price_details($classesPriceId: Int!, $classesId: Int!) {
    insert_classes_price_details(
      objects: [{ classes_price_id: $classesPriceId, classes_id: $classesId }]
    ) {
      affected_rows
    }
  }
`;*/

export const UPDATE_CLASSES_PRICE_STATUS = gql`
  mutation update_classes_price_status($id: Int!, $newStatus: Int!) {
    update_classes_price(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
    }
  }
`;
/* update_classes_price_details(
  where: { classes_price_id: { _eq: $id } }
  _set: { status: $newStatus }
) {
  affected_rows
} */

export const UPDATE_CLASSES_PRICE_NAME = gql`
  mutation update_classes_price_name($classesPriceId: Int!, $name: String!) {
    update_classes_price(
      where: { id: { _eq: $classesPriceId } }
      _set: { name: $name }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CLASSES_PRICE_DETAILS_STATUS = gql`
  mutation update_classes_price_details_status($id: Int!, $newStatus: Int!) {
    update_classes_price_details(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
    }
  }
`;

export const ADD_CLASS_PRICE_DETAILS = gql`
  mutation add_class_price_detail($classPriceId: Int!, $classId: Int!) {
    insert_classes_price_details(
      objects: { classes_price_id: $classPriceId, classes_id: $classId }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CLASSES_PRICE_PAYMENT_PERIOD_STATUS = gql`
  mutation update_classes_price_payment_period_status(
    $id: Int!
    $newStatus: Int!
  ) {
    update_classes_price_payment_period(
      where: { id: { _eq: $id } }
      _set: { status: $newStatus }
    ) {
      affected_rows
    }
  }
`;

export const ADD_CLASS_PRICE_PAYMENT_PERIOD = gql`
  mutation add_class_price_payment_period(
    $classPriceId: Int!
    $paymentPeriodId: Int!
    $persons: Int!
    $total: numeric!
    $specifications: String!
  ) {
    insert_classes_price_payment_period(
      objects: {
        classes_price_id: $classPriceId
        payment_period_id: $paymentPeriodId
        persons: $persons
        total: $total
        specifications: $specifications
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CLASS_PRICE_PAYMENT_PERIOD = gql`
  mutation update_class_price_payment_period(
    $classPricePaymentPeriodId: Int!
    $paymentPeriodId: Int!
    $persons: Int!
    $total: numeric!
    $specifications: String!
  ) {
    update_classes_price_payment_period(
      where: { id: { _eq: $classPricePaymentPeriodId } }
      _set: {
        payment_period_id: $paymentPeriodId
        persons: $persons
        total: $total
        specifications: $specifications
      }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_LOCKET_BY_ID = gql`
  mutation delete_locker_by_id($lockerId: Int!, $lockerDetailId: bigint!) {
    update_lockers(where: { id: { _eq: $lockerId } }, _set: { status: 0 }) {
      affected_rows
    }
    update_lockers_details(
      where: { id: { _eq: $lockerDetailId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
  }
`;

export const RESTORE_LOCKET_BY_ID = gql`
  mutation restore_locker_by_id($lockerId: Int!) {
    update_lockers(where: { id: { _eq: $lockerId } }, _set: { status: 1 }) {
      affected_rows
    }
  }
`;

export const ADD_LOCKER = gql`
  mutation add_locker($number: Int!) {
    insert_lockers(objects: { number: $number }) {
      affected_rows
    }
  }
`;

export const UPDATE_LOCKER = gql`
  mutation update_locker($lockerId: Int!, $number: Int!) {
    update_lockers(
      where: { id: { _eq: $lockerId } }
      _set: { number: $number }
    ) {
      affected_rows
    }
  }
`;

export const ADD_LOCKER_DETAIL = gql`
  mutation add_locker_detail(
    $lockerId: Int!
    $userId: Int!
    $paymentType: Int!
    $paymentStart: date!
    $paymentEnd: date!
    $lockerPrice: numeric!
  ) {
    insert_lockers_details(
      objects: {
        locker_id: $lockerId
        user_id: $userId
        payment_type: $paymentType
        payment_start: $paymentStart
        payment_end: $paymentEnd
        cost: $lockerPrice
      }
    ) {
      affected_rows
    }
  }
`;

export const ADD_AND_UPDATE_LOCKER_DETAIL = gql`
  mutation add_and_update_locker_detail(
    $lockerDetailId: bigint!
    $lockerId: Int!
    $userId: Int!
    $paymentType: Int!
    $paymentStart: date!
    $paymentEnd: date!
    $lockerPrice: numeric!
  ) {
    update_lockers_details(
      where: { id: { _eq: $lockerDetailId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
    insert_lockers_details(
      objects: {
        locker_id: $lockerId
        user_id: $userId
        payment_type: $paymentType
        payment_start: $paymentStart
        payment_end: $paymentEnd
        cost: $lockerPrice
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_LOCKER_DETAIL_STATUS = gql`
  mutation update_locker_detail_status($lockerDetailId: bigint!) {
    update_lockers_details(
      where: { id: { _eq: $lockerDetailId } }
      _set: { status: 0 }
    ) {
      affected_rows
    }
  }
`;

export const ADD_LOCKERS_SETTINGS = gql`
  mutation add_lockers_settings($price: numeric!) {
    insert_lockers_settings(objects: { price: $price }) {
      affected_rows
    }
  }
`;

export const UPDATE_LOCKERS_SETTINGS = gql`
  mutation update_lockers_settings($lockersSettingsId: Int!, $price: numeric!) {
    update_lockers_settings(
      where: { id: { _eq: $lockersSettingsId } }
      _set: { price: $price }
    ) {
      affected_rows
    }
  }
`;
