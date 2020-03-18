import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { Grid, Typography, CircularProgress, Divider } from "@material-ui/core";
import Chart from "react-apexcharts";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import moment from "moment";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import {
  GET_USER_BY_ID_AUTH,
  GET_ALL_USER_PAYMENTS_COUNTED_BY_DATE,
  GET_ALL_USER_PAYMENTS_CREDIT_BY_DATE,
  GET_ALL_LOCKER_PAYMENTS_COUNTED_BY_DATE,
  GET_ALL_LOCKER_PAYMENTS_CREDIT_BY_DATE
} from "../../database/queries";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

const formatStartDate = date => {
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  return `${date.getFullYear()}-${correctMont}-01`;
};

const formatEndDate = date => {
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const daysOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
  return `${date.getFullYear()}-${correctMont}-${daysOfMonth}`;
};

export default function Reports(props) {
  const [startDate, setStartDate] = useState(
    new Date(moment().format("YYYY/MM/01"))
  );
  const [endDate, setEndDate] = useState(
    new Date(moment().format("YYYY/MM/01"))
  );
  const [startDateLockers, setStartDateLockers] = useState(
    new Date(moment().format("YYYY/MM/01"))
  );
  const [endDateLockers, setEndDateLockers] = useState(
    new Date(moment().format("YYYY/MM/01"))
  );
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const { data: userAuthData, error: userAuthError } = useQuery(
    GET_USER_BY_ID_AUTH,
    {
      variables: {
        id: userIdAuth
      },
      onCompleted: () => {
        if (userAuthData.users.length === 0 && userIdAuth !== 0) {
          localStorage.removeItem("token");
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      }
    }
  );
  const {
    data: userPaymentsCountedData,
    loading: userPaymentsCountedLoading,
    error: userPaymentsCountedError
  } = useSubscription(GET_ALL_USER_PAYMENTS_COUNTED_BY_DATE, {
    variables: {
      startDate: formatStartDate(startDate),
      endDate: formatEndDate(endDate)
    }
  });
  const {
    data: userPaymentsCreditData,
    loading: userPaymentsCreditLoading,
    error: userPaymentsCreditError
  } = useSubscription(GET_ALL_USER_PAYMENTS_CREDIT_BY_DATE, {
    variables: {
      startDate: formatStartDate(startDate),
      endDate: formatEndDate(endDate)
    }
  });
  const {
    data: lockersPaymentsCountedData,
    loading: lockersPaymentsCountedLoading,
    error: lockersPaymentsCountedError
  } = useSubscription(GET_ALL_LOCKER_PAYMENTS_COUNTED_BY_DATE, {
    variables: {
      startDate: formatStartDate(startDateLockers),
      endDate: formatEndDate(endDateLockers)
    }
  });

  const {
    data: lockersPaymentsCreditData,
    loading: lockersPaymentsCreditLoading,
    error: lockersPaymentsCreditError
  } = useSubscription(GET_ALL_LOCKER_PAYMENTS_CREDIT_BY_DATE, {
    variables: {
      startDate: formatStartDate(startDateLockers),
      endDate: formatEndDate(endDateLockers)
    }
  });

  registerLocale("es", es);

  useEffect(() => {
    function isUserAuth() {
      try {
        if (localStorage.getItem("token")) {
          const decodedToken = jwt.verify(
            localStorage.getItem("token"),
            "mysecretpassword"
          );
          setUserIdAuth(decodedToken.id);
        } else {
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUserAuth(false);
        setUserAuthHeader(false);
      }
    }

    isUserAuth();
  });

  useEffect(() => {
    setEndDate(endDate < startDate ? startDate : endDate);
  }, [startDate, endDate]);

  if (
    userPaymentsCountedLoading ||
    userPaymentsCreditLoading ||
    lockersPaymentsCountedLoading ||
    lockersPaymentsCreditLoading
  ) {
    return <CircularProgress />;
  }

  if (
    userAuthError ||
    userPaymentsCountedError ||
    userPaymentsCreditError ||
    lockersPaymentsCountedError ||
    lockersPaymentsCreditError
  ) {
    return <NotFound />;
  }

  const counted =
    userPaymentsCountedData.users_payments_aggregate.aggregate.sum.total;
  const credit =
    userPaymentsCreditData.users_payments_aggregate.aggregate.sum.total;
  const countedLockers =
    lockersPaymentsCountedData.lockers_details_aggregate.aggregate.sum.cost;
  const creditLockers =
    lockersPaymentsCreditData.lockers_details_aggregate.aggregate.sum.cost;

  const totalMoneyClasses = counted + credit;

  const state = {
    series: [
      {
        name: "Total",
        data: [counted !== null ? counted : 0, credit !== null ? credit : 0]
      }
    ],
    options: {
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      colors: ["#1976D2", "#FFC107"],
      xaxis: {
        categories: [["Efectivo"], ["Tarjeta de crédito"]],
        labels: {
          style: {
            fontSize: "12px"
          }
        }
      },
      title: {
        text: "Total "+totalMoneyClasses,
        align: "center",
        margin: 20,
        style: {
          fontSize: "16px"
        }
      }
    }
  };

  const totalMoneyLockers = countedLockers + creditLockers;

  const stateLockers = {
    series: [
      {
        name: "Total",
        data: [
          countedLockers !== null ? countedLockers : 0,
          creditLockers !== null ? creditLockers : 0
        ]
      }
    ],
    options: {
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      colors: ["#1976D2", "#FFC107"],
      xaxis: {
        categories: [["Efectivo"], ["Tarjeta de crédito"]],
        labels: {
          style: {
            fontSize: "12px"
          }
        }
      },
      title: {
        text: "Total : " + totalMoneyLockers,
        align: "center",
        margin: 20,
        style: {
          fontSize: "16px"
        }
      }
    }
  };

  return userAuth ? (
    <Grid container justify="center" spacing={3}>
      <Grid item xs={12} md={12} lg={6}>
        <Grid container justify="center" spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Reporte de ventas</Typography>
            <Divider />
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
            <Typography>Desde: </Typography>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              locale="es"
            />
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
            <Typography>Hasta: </Typography>
            <DatePicker
              selected={endDate < startDate ? startDate : endDate}
              onChange={date =>
                setEndDate(endDate < startDate ? startDate : date)
              }
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              locale="es"
              minDate={startDate}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            {counted !== null || credit !== null ? (
              <Chart
                options={state.options}
                series={state.series}
                type="bar"
                height={350}
              ></Chart>
            ) : (
              <Typography variant="h6" style={{ textAlign: "center" }}>
                Sin datos
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <Grid container justify="center" spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">
              Reporte de ventas de casilleros
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
            <Typography>Desde: </Typography>
            <DatePicker
              selected={startDateLockers}
              onChange={date => setStartDateLockers(date)}
              selectsStart
              startDate={startDateLockers}
              endDate={endDateLockers}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              locale="es"
            />
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
            <Typography>Hasta: </Typography>
            <DatePicker
              selected={
                endDateLockers < startDateLockers
                  ? startDateLockers
                  : endDateLockers
              }
              onChange={date =>
                setEndDateLockers(
                  endDateLockers < startDateLockers ? startDateLockers : date
                )
              }
              selectsEnd
              startDate={startDateLockers}
              endDate={endDateLockers}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              locale="es"
              minDate={startDateLockers}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            {countedLockers !== null || creditLockers !== null ? (
              <Chart
                options={stateLockers.options}
                series={stateLockers.series}
                type="bar"
                height={350}
              ></Chart>
            ) : (
              <Typography variant="h6" style={{ textAlign: "center" }}>
                Sin datos
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Redirect to="/login" />
  );
}
