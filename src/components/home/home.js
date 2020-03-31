import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import {
  Grid,
  Card,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Toolbar,
  Snackbar
} from "@material-ui/core";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_USER_BY_ID_AUTH,
  GET_USERS_PAYMENTS_EXPIRED,
  GER_USER_PAYMENTS_ALMOST_EXPIRED,
  GET_USER_ASSISTS,
  GET_NEW_CLIENTS,
  GET_MEMBERS_CLASSES
} from "../../database/queries";
import { UPDATE_USER_PAYMENT_STATUS } from "../../database/mutations";
import NotFound from "../notFound/notFound";
import Chart from "react-apexcharts";
const jwt = require("jsonwebtoken");

const useStyles = makeStyles(theme => ({
  items: {
    marginTop: "10px",
    marginBottom: "10px"
  },
  cards: {
    padding: "10px"
  },
  table: {
    height: "350px",
    overflowY: "auto"
  },
  tableTittle: {
    fontSize: "16px",
    color: "#373d3f",
    textAlign: "center",
    fontFamily: "Helvetica, Arial, sans-serif",
    display: "grid"
  }
}));

const formatDate = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const formatDateWhitoutMinutes = date => {
  date = new Date(date);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const formatDateWhitoutMinutesMoreDays = (date, days) => {
  date = new Date(date);
  date.setDate(date.getDate() + days);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const formatDateExpired = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${correctDay}/${correctMont}/${date.getFullYear()}`;
};

const dayOfWeek = date => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.getUTCDay();
};

const subDays = (date, days) => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  date.setDate(date.getDate() - days);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

const sumDays = (date, days) => {
  date = new Date(date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  date.setDate(date.getDate() + days);
  let correctMont =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  let correctDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${date.getFullYear()}-${correctMont}-${correctDay}`;
};

export default function Home(props) {
  const classes = useStyles();
  const now = Date.now();
  const twoDaysMore = formatDateWhitoutMinutesMoreDays(now, 2);
  const weekDay =
    dayOfWeek(formatDateWhitoutMinutes(now)) !== 0
      ? dayOfWeek(formatDateWhitoutMinutes(now))
      : 7;
  const mondayDay = subDays(formatDateWhitoutMinutes(now), weekDay - 1);
  const [
    dialogDeleteUserToClassesState,
    setDialogDeleteUserToClassesState
  ] = useState({
    openDeleteUserToClassesDialog: false,
    tittleDeleteUserToClassesDialog: "",
    textDeleteUserToClassesDialog: "",
    idUserPaymentDialog: 0
  });
  const {
    openDeleteUserToClassesDialog,
    tittleDeleteUserToClassesDialog,
    textDeleteUserToClassesDialog,
    idUserPaymentDialog
  } = dialogDeleteUserToClassesState;
  const [snackbarState, setSnackbarState] = useState({
    openSnackbar: false,
    vertical: "bottom",
    horizontal: "right",
    snackBarText: "",
    snackbarColor: ""
  });
  const {
    vertical,
    horizontal,
    openSnackbar,
    snackBarText,
    snackbarColor
  } = snackbarState;
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
    data: userPaymentData,
    loading: userPaymentLoading,
    error: userPaymentError
  } = useSubscription(GET_USERS_PAYMENTS_EXPIRED, {
    variables: {
      now: formatDateWhitoutMinutes(now)
    }
  });
  const {
    data: userPaymentAEData,
    loading: userPaymentAELoading,
    error: userPaymentAEError
  } = useSubscription(GER_USER_PAYMENTS_ALMOST_EXPIRED, {
    variables: {
      now: formatDateWhitoutMinutes(now),
      twoDaysMore: twoDaysMore
    }
  });
  const {
    data: userAssistsData,
    loading: userAssistsLoading,
    error: userAssistsError
  } = useSubscription(GET_USER_ASSISTS, {
    variables: {
      firstWeekDay: mondayDay,
      currentLastWeekDay: formatDateWhitoutMinutes(now)
    }
  });
  const {
    data: newClientsData,
    loading: newClientsLoading,
    error: newClientsError
  } = useSubscription(GET_NEW_CLIENTS, {
    variables: {
      firstWeekDay: mondayDay,
      currentLastWeekDay: formatDateWhitoutMinutes(now)
    }
  });
  const {
    data: membersClasesData,
    loading: membersClasesLoading,
    error: membersClasesError
  } = useSubscription(GET_MEMBERS_CLASSES);
  const [
    updateUserPaymentMutation,
    { loading: updateUserPaymentMutationLoading, error: updateUserPaymentMutationError }
  ] = useMutation(UPDATE_USER_PAYMENT_STATUS);

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

  if (
    userPaymentLoading ||
    userAssistsLoading ||
    userPaymentAELoading ||
    newClientsLoading ||
    membersClasesLoading
  ) {
    return <CircularProgress />;
  }

  if (
    userAuthError ||
    userPaymentError ||
    userPaymentAEError ||
    userAssistsError ||
    newClientsError ||
    membersClasesError
  ) {
    return <NotFound />;
  }

  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  let currentWeekDays = [];
  let dataWeekDays = [];
  let dataNewClients = [];
  let dataMembersClases = [];
  for (let x = 0; x < weekDay; x++) {
    currentWeekDays.push(sumDays(mondayDay, x));
  }
  for (let x = 0; x < userAssistsData.user_assists.length; x++) {
    dataWeekDays.push(formatDate(userAssistsData.user_assists[x].created));
  }
  for (let x = 0; x < newClientsData.users_data.length; x++) {
    dataNewClients.push(newClientsData.users_data[x].created);
  }
  for (let x = 0; x < membersClasesData.classes.length; x++) {
    dataMembersClases.push({
      name: membersClasesData.classes[x].name,
      members:
        membersClasesData.classes[x].R_classes_details_aggregate.aggregate.count
    });
  }

  let dataMembersClasesSort = dataMembersClases.sort(function(a, b) {
    if (a.members < b.members) {
      return 1;
    }
    if (a.members > b.members) {
      return -1;
    }
    return 0;
  });

  dataMembersClasesSort = dataMembersClasesSort.splice(0, 3);

  let dataMembersClasesName = [];
  let dataMembersClasesMembers = [];

  for (let x = 0; x < dataMembersClasesSort.length; x++) {
    dataMembersClasesName.push(dataMembersClasesSort[x].name);
    dataMembersClasesMembers.push(dataMembersClasesSort[x].members);
  }

  const weekDaysPie = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];
  let dataWeekDaysPie = [];
  let dataNewClientsPie = [];
  for (let x = 0; x < currentWeekDays.length; x++) {
    let count = 0;
    let countNewClients = 0;
    for (let y = 0; y < dataWeekDays.length; y++) {
      if (currentWeekDays[x] === dataWeekDays[y]) {
        count++;
      }
    }
    dataWeekDaysPie.push(count);
    for (let y = 0; y < dataNewClients.length; y++) {
      if (currentWeekDays[x] === dataNewClients[y]) {
        countNewClients++;
      }
    }
    dataNewClientsPie.push(countNewClients);
  }
  const backgroundColorsWeekDayPie = [
    "#448AFF",
    "#FFA000",
    "#000000",
    "#757575",
    "#689F38",
    "#795548"
  ];

  const backgroundColorsMembersClases = ["#448AFF", "#FFA000", "#757575"];

  let currentWeekDaysPie = [];
  let currentDataWeekDaysPie = [];
  let currentDataNewClientsPie = [];
  let currentBackgroundColorsWeekDayPie = [];

  for (let x = 0; x < weekDay; x++) {
    currentWeekDaysPie.push(weekDaysPie[x]);
    currentDataWeekDaysPie.push(dataWeekDaysPie[x]);
    currentDataNewClientsPie.push(dataNewClientsPie[x]);
    currentBackgroundColorsWeekDayPie.push(backgroundColorsWeekDayPie[x]);
  }

  const handleOpenDeleteUserToClassesDialog = userPaymentId => {
    setDialogDeleteUserToClassesState({
      openDeleteUserToClassesDialog: true,
      tittleDeleteUserToClassesDialog:
        "¿Desea dar de baja al cliente de esta(s) clase(s)?",
      textDeleteUserToClassesDialog:
        "Al dar de baja al usuario de esta(s) clase(s) ya no podrá ingresar a esta(s).",
      idUserPaymentDialog: userPaymentId
    });
  };

  const handleCloseDeleteUserToClassesDialog = agree => {
    if (agree) {
      updateUserPaymentMutation({
        variables: {
          userPaymentId: idUserPaymentDialog,
        }
      });
  
      if (updateUserPaymentMutationLoading) return <CircularProgress />;
      if (updateUserPaymentMutationError) {
        setSnackbarState({
          ...snackbarState,
          openSnackbar: true,
          snackBarText: "An error occurred",
          snackbarColor: "#d32f2f"
        });
        return;
      }

      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Cliente dado de baja de clases(s)",
        snackbarColor: "#43a047"
      });
    }
    setDialogDeleteUserToClassesState({
      openDeleteUserToClassesDialog: false,
      tittleDeleteUserToClassesDialog: "",
      textDeleteUserToClassesDialog: "",
      idUserPaymentDialog: 0
    });
  };

  const state = {
    series: [
      {
        name: "Número de miembros",
        data: dataMembersClasesMembers
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
      colors: ["#f44336", "#2196f3", "#4caf50"],
      xaxis: {
        categories: dataMembersClasesName,
        labels: {
          style: {
            fontSize: "12px"
          }
        }
      },
      title: {
        text: "3 clases con más miembros",
        align: "center",
        margin: 20,
        style: {
          fontSize: "16px"
        }
      }
    }
  };

  const optionsChartRadar = {
    chart: {
      id: "basic-bar",
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        barHeight: "100%",
        distributed: true,
        dataLabels: {
          position: "bottom"
        }
      }
    },
    colors: backgroundColorsMembersClases,
    xaxis: {
      categories: currentWeekDaysPie
    },
    title: {
      text: "Visitas",
      align: "center",
      margin: 20,
      style: {
        fontSize: "16px"
      }
    }
  };

  const seriesChartRadar = [
    {
      name: "Visitas",
      data: currentDataWeekDaysPie
    }
  ];

  const optionsChartRadar2 = {
    chart: {
      id: "basic-bar",
      zoom: {
        enabled: false
      }
    },
    colors: backgroundColorsMembersClases,
    labels: currentWeekDaysPie,
    legend: {
      position: "bottom"
    },
    title: {
      text: "Clientes nuevos",
      align: "center",
      margin: 20,
      style: {
        fontSize: "16px"
      }
    }
  };

  const seriesChartRadar2 = [
    {
      name: "Clientes nuevos",
      data: currentDataNewClientsPie
    }
  ];

  return userAuth ? (
    <Grid container justify="center" spacing={3}>
      <Grid item xs={12} md={12} lg={6} className={classes.items}>
        <TableContainer component={Card} className={classes.table}>
          <Toolbar className={classes.tableTittle}>
            <strong>Clientes con pago vencido</strong>
          </Toolbar>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Cliente</TableCell>
                <TableCell align="center">Clase(s)</TableCell>
                <TableCell align="center">Vencimiento</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPaymentData.users_payments.length > 0 ? userPaymentData.users_payments.map(row => (
                <TableRow key={row.userPaymentId}>
                  <TableCell component="th" scope="row">
                    {`${row.R_users_data.first_name} ${row.R_users_data.last_name}`}
                  </TableCell>
                  <TableCell align="right">
                    {row.R_classes_price_payment_period.R_classes_price.R_classes_price_details.map(
                      (aClass, index) => (
                        <Typography key={index} variant="subtitle1">{`${
                          aClass.R_classes.name
                        }${
                          row.R_classes_price_payment_period.R_classes_price
                            .R_classes_price_details.length ===
                          index + 1
                            ? "."
                            : ","
                        } `}</Typography>
                      )
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatDateExpired(row.payment_end)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={() => {
                        handleOpenDeleteUserToClassesDialog(row.userPaymentId);
                      }}
                      style={{ background: "#000000" }}
                    >
                      Dar de baja en clase(s)
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="h5" style={{textAlign: "center"}}>No hay clientes con pago vencido</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={12} lg={6} className={classes.items}>
        <TableContainer component={Card} className={classes.table}>
          <Toolbar className={classes.tableTittle}>
            <strong>Clientes con pago casi vencido</strong>
          </Toolbar>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Cliente</TableCell>
                <TableCell align="center">Número telefónico</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Clase(s)</TableCell>
                <TableCell align="center">Vencimiento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPaymentAEData.users_payments.length > 0 ? (
                userPaymentAEData.users_payments.map(row => (
                  <TableRow key={row.userPaymentId}>
                    <TableCell component="th" scope="row">
                      {`${row.R_users_data.first_name} ${row.R_users_data.last_name}`}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {`${row.R_users_data.phone_number}`}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {`${row.R_users_data.email}`}
                    </TableCell>
                    <TableCell align="right">
                      {row.R_classes_price_payment_period.R_classes_price.R_classes_price_details.map(
                        (aClass, index) => (
                          <Typography key={index} variant="subtitle1">{`${
                            aClass.R_classes.name
                          }${
                            row.R_classes_price_payment_period.R_classes_price
                              .R_classes_price_details.length ===
                            index + 1
                              ? "."
                              : ","
                          } `}</Typography>
                        )
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatDateExpired(row.payment_end)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="h5" style={{textAlign: "center"}}>No hay clientes con pago casi vencido</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={12} lg={4} className={classes.items}>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Chart
            options={optionsChartRadar}
            series={seriesChartRadar}
            type="area"
            height="300"
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={12} lg={4} className={classes.items}>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Chart
            options={optionsChartRadar2}
            series={seriesChartRadar2}
            type="area"
            height="300"
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={12} lg={4} className={classes.items}>
        <Card className={classes.cards} style={{ height: "350px" }}>
          <Chart
            options={state.options}
            series={state.series}
            type="bar"
            height="300"
          />
        </Card>
      </Grid>
      <Dialog
        open={openDeleteUserToClassesDialog}
        onClose={() => {
          handleCloseDeleteUserToClassesDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDeleteUserToClassesDialog}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textDeleteUserToClassesDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDeleteUserToClassesDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseDeleteUserToClassesDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackBarText}</span>}
      />
    </Grid>
  ) : (
    <Redirect to="/login" />
  );
}
