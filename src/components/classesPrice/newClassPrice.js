import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  Grid,
  TextField,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Remove as RemoveIcon,
  Add as AddIcon
} from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_PAYMENT_PERIODS, GET_CLASSES_ALL } from "../../database/queries";
import NotFound from "../notFound/notFound";
import { keyValidation, pasteValidation } from "../../helpers/helpers";
import gql from "graphql-tag";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(3)
  },
  root: {
    padding: theme.spacing(3, 2)
  },
  textFields: {
    width: "100%"
  },
  button: {
    float: "right",
    margin: theme.spacing(2, 0),
    backgroundColor: "#ffc605",
    "&:hover": {
      backgroundColor: "#ffff00"
    }
  }
}));

export default function NewClassPrice() {
  const classes = useStyles();
  const [classPriceState, setClassPriceState] = useState({
    name: "",
    payment_period: [0],
    persons: [""],
    total: [""],
    clasess_id: [0],
    specifications: [""]
  });
  const [disabledButton, setDisabledButton] = useState(false);
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
  const [classPriceDetails, setClassPriceDetails] = useState("");
  const [classPricePayments, setClassPricePayments] = useState("");
  const ADD_CLASS_PRICE_AND_DETAILS = gql`
    mutation add_class_price_and_details(
      $name: String
    ) {
      insert_classes_price(
        objects: {
          name: $name
          R_classes_price_details: {
            data: [${classPriceDetails}]
          }
          R_classes_price_payment_periods: {
            data: [${classPricePayments}]
          }
        }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const [
    addClassPriceMutation,
    { loading: classPriceLoading, error: classPriceError }
  ] = useMutation(ADD_CLASS_PRICE_AND_DETAILS);
  const {
    data: paymentData,
    loading: paymentLoading,
    error: paymentError
  } = useSubscription(GET_PAYMENT_PERIODS);
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError
  } = useSubscription(GET_CLASSES_ALL);
  if (paymentLoading || classesLoading) {
    return <CircularProgress />;
  }
  if (paymentError || classesError) {
    return <NotFound />;
  }

  const getPaymentPeriods = () => {
    return paymentData.payment_periods.map(paymentPeriod => {
      return (
        <option key={paymentPeriod.id} value={paymentPeriod.id}>
          {paymentPeriod.period}
        </option>
      );
    });
  };

  const getClasses = () => {
    return classesData.classes.map(aClass => {
      return (
        <option key={aClass.id} value={aClass.id}>
          {`${aClass.name} (${aClass.R_users_data.first_name} ${aClass.R_users_data.last_name})`}
        </option>
      );
    });
  };

  const addClassInput = () => {
    if (classPriceState.clasess_id.length < 10) {
      let newClasses = classPriceState.clasess_id;
      newClasses.push(0);
      setClassPriceState({
        ...classPriceState,
        clasess_id: newClasses
      });
    } else {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "El límite de clases para agregar es 10",
        snackbarColor: "#d32f2f"
      });
    }
  };

  const addPaymentInput = () => {
    if (classPriceState.payment_period.length < 10) {
      let newPaymentPeriod = classPriceState.payment_period;
      let newPersons = classPriceState.persons;
      let newTotal = classPriceState.total;
      let newSpecifications = classPriceState.specifications;
      newPaymentPeriod.push(0);
      newPersons.push("");
      newTotal.push("");
      newSpecifications.push("");
      setClassPriceState({
        ...classPriceState,
        payment_period: newPaymentPeriod,
        persons: newPersons,
        total: newTotal,
        specifications: newSpecifications
      });
    } else {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "El límite de períodos de pago para agregar es 10",
        snackbarColor: "#d32f2f"
      });
    }
  };

  const deleteClassInput = i => {
    const classes = classPriceState.clasess_id;
    const newClasses = classes.filter((aClass, index) => i !== index);
    setClassPriceState({
      ...classPriceState,
      clasess_id: newClasses
    });
  };

  const deletePaymentInput = i => {
    const paymentPeriods = classPriceState.payment_period;
    const persons = classPriceState.persons;
    const totals = classPriceState.total;
    const specifications = classPriceState.specifications;
    const newPaymentPeriods = paymentPeriods.filter(
      (paymentPeriod, index) => i !== index
    );
    const newPersons = persons.filter((person, index) => i !== index);
    const newTotals = totals.filter((total, index) => i !== index);
    const newSpecifications = specifications.filter(
      (specification, index) => i !== index
    );
    setClassPriceState({
      ...classPriceState,
      payment_period: newPaymentPeriods,
      persons: newPersons,
      total: newTotals,
      specifications: newSpecifications
    });
  };

  const addClassPriceDetailsAndPaymentsData = () => {
    const { clasess_id, payment_period } = classPriceState;
    let dataQueryDetails = "";
    let dataQueryPayments = "";

    for (let x = 0; x < clasess_id.length; x++) {
      dataQueryDetails += `{classes_id: ${classPriceState.clasess_id[x]}},`;
    }
    for (let x = 0; x < payment_period.length; x++) {
      dataQueryPayments += `{payment_period_id: ${
        classPriceState.payment_period[x]
      }, persons: ${parseInt(classPriceState.persons[x])}, total: ${parseInt(
        classPriceState.total[x]
      )} , specifications: "${classPriceState.specifications[x]}"},`;
    }

    setClassPriceDetails(dataQueryDetails);
    setClassPricePayments(dataQueryPayments);
  };

  const runMutationClassPrice = () => {
    const { name } = classPriceState;

    addClassPriceMutation({
      variables: {
        name: name.trim()
      }
    });

    if (classPriceLoading) return <CircularProgress />;
    if (classPriceError) {
      setSnackbarState({
        ...snackbarState,
        openSnackbar: true,
        snackBarText: "Ha ocurrido un error",
        snackbarColor: "#d32f2f"
      });
      setDisabledButton(false);
      return;
    }

    setClassPriceState({
      name: "",
      payment_period: [0],
      persons: [""],
      total: [""],
      clasess_id: [0],
      specifications: [""]
    });

    setSnackbarState({
      ...snackbarState,
      openSnackbar: true,
      snackBarText: "Precio de clase o paquete agregado",
      snackbarColor: "#43a047"
    });

    setDisabledButton(false);
  };

  const addClassPrice = async () => {
    setDisabledButton(true);
    const { clasess_id, payment_period, persons, total } = classPriceState;

    for (let x = 0; x < clasess_id.length; x++) {
      if (parseInt(clasess_id[x]) === 0) {
        setSnackbarState({
          ...snackbarState,
          openSnackbar: true,
          snackBarText: "Selecciona una clase en el campo clase " + (x + 1),
          snackbarColor: "#d32f2f"
        });
        setDisabledButton(false);
        return;
      }
    }

    let validationClasses = 0;
    for (let x = 0; x < clasess_id.length; x++) {
      validationClasses = 0;
      for (let y = x + 1; y <= clasess_id.length - 1; y++) {
        if (clasess_id[x] === clasess_id[y]) {
          validationClasses++;
        }
        if (validationClasses > 0) {
          setSnackbarState({
            ...snackbarState,
            openSnackbar: true,
            snackBarText: "No selecciones la misma clase dos veces",
            snackbarColor: "#d32f2f"
          });
          setDisabledButton(false);
          return;
        }
      }
    }

    for (let x = 0; x < payment_period.length; x++) {
      if (parseInt(payment_period[x]) === 0) {
        setSnackbarState({
          ...snackbarState,
          openSnackbar: true,
          snackBarText:
            "Selecciona un período de pago en el campo período de pago " +
            (x + 1),
          snackbarColor: "#d32f2f"
        });
        setDisabledButton(false);
        return;
      }
      if (
        persons[x].trim() === "" ||
        persons[x].trim() === "0" ||
        persons[x].trim() === "00"
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackbar: true,
          snackBarText:
            "Ingresa el número de personas en el campo personas " +
            (x + 1) +
            " (debe de ser mayor a 0)",
          snackbarColor: "#d32f2f"
        });
        setDisabledButton(false);
        return;
      }
      if (total[x].trim() === "") {
        setSnackbarState({
          ...snackbarState,
          openSnackbar: true,
          snackBarText: "Ingresa el total en el campo total " + (x + 1),
          snackbarColor: "#d32f2f"
        });
        setDisabledButton(false);
        return;
      }
    }
    await addClassPriceDetailsAndPaymentsData();
    runMutationClassPrice();
  };

  const handleClose = () => {
    setSnackbarState({ ...snackbarState, openSnackbar: false });
  };

  return (
    <Card>
      <Toolbar>
        <Typography variant="h6">
          Agregar precio de clase o paquete
          <Tooltip title="Regresar">
            <Link to="/classesPrice">
              <ArrowBackIcon />
            </Link>
          </Tooltip>
        </Typography>
      </Toolbar>
      <Grid container justify="center" className={classes.root}>
        <Grid item md={11} xs={10}>
          <TextField
            className={classes.textFields}
            id="name"
            label="Nombre"
            margin="normal"
            value={classPriceState.name}
            inputProps={{
              maxLength: 50
            }}
            onKeyPress={e => {
              keyValidation(e, 6);
            }}
            onChange={e => {
              pasteValidation(e, 6);
              setClassPriceState({
                ...classPriceState,
                name: e.target.value
              });
            }}
          />
        </Grid>
        {classPriceState.clasess_id.map((value, index) => (
          <Grid container justify="center" alignItems="flex-end" key={index}>
            <Grid item md={9} xs={8}>
              <TextField
                className={classes.textFields}
                required
                select
                SelectProps={{
                  native: true
                }}
                id="clasess_id"
                label={
                  classPriceState.clasess_id.length === 1
                    ? `Clase`
                    : `Clase ${index + 1}`
                }
                margin="normal"
                value={classPriceState.clasess_id[index]}
                onChange={e => {
                  let newClasses_id = classPriceState.clasess_id;
                  newClasses_id[index] = e.target.value;
                  setClassPriceState({
                    ...classPriceState,
                    clasess_id: newClasses_id
                  });
                }}
              >
                <option value="0">Selecciona una clase</option>
                {getClasses()}
              </TextField>
            </Grid>
            <Grid item md={2} xs={2}>
              {index !== 0 ? (
                <Tooltip title="Quitar clase">
                  <IconButton
                  onClick={() => {
                    deleteClassInput(index);
                  }}
                >
                  <RemoveIcon style={{ color: "#D32F2F" }} />
                </IconButton>
                </Tooltip>
              ) : null}
            </Grid>
          </Grid>
        ))}
        <Grid item md={8} xs={10}>
          <Tooltip title="Agregar clase">
          <IconButton
            style={{ float: "right" }}
            onClick={() => {
              addClassInput();
            }}
          >
            <AddIcon style={{ color: "#43a047" }} />
          </IconButton>
          </Tooltip>
        </Grid>
        {classPriceState.payment_period.map((input, index) => (
          <Grid container justify="center" alignItems="flex-end" key={index}>
            <Grid item md={2} xs={8}>
              <TextField
                className={classes.textFields}
                required
                select
                SelectProps={{
                  native: true
                }}
                id="payment_period"
                label={
                  classPriceState.payment_period.length === 1
                    ? `Período de pago`
                    : `Período de pago ${index + 1}`
                }
                margin="normal"
                value={classPriceState.payment_period[index]}
                onChange={e => {
                  let newpayment_period = classPriceState.payment_period;
                  newpayment_period[index] = e.target.value;
                  setClassPriceState({
                    ...classPriceState,
                    payment_period: newpayment_period
                  });
                }}
              >
                <option value="0">Selecciona un período de pago</option>
                {getPaymentPeriods()}
              </TextField>
            </Grid>
            <Grid item md={1} xs={2}></Grid>
            <Grid item md={1} xs={8}>
              <TextField
                className={classes.textFields}
                required
                id="persons"
                label="Personas"
                margin="normal"
                value={classPriceState.persons[index]}
                inputProps={{
                  maxLength: 2
                }}
                onKeyPress={e => {
                  keyValidation(e, 2);
                }}
                onChange={e => {
                  pasteValidation(e, 2);
                  let newPerson = classPriceState.persons;
                  newPerson[index] = e.target.value;
                  setClassPriceState({
                    ...classPriceState,
                    persons: newPerson
                  });
                }}
              />
            </Grid>
            <Grid item md={1} xs={2}></Grid>
            <Grid item md={1} xs={8}>
              <TextField
                className={classes.textFields}
                required
                id="total"
                label="Total"
                margin="normal"
                value={classPriceState.total[index]}
                inputProps={{
                  maxLength: 6
                }}
                onKeyPress={e => {
                  keyValidation(e, 2);
                }}
                onChange={e => {
                  pasteValidation(e, 2);
                  let newTotal = classPriceState.total;
                  newTotal[index] = e.target.value;
                  setClassPriceState({
                    ...classPriceState,
                    total: newTotal
                  });
                }}
              />
            </Grid>
            <Grid item md={1} xs={2}></Grid>
            <Grid item md={2} xs={8}>
              <TextField
                className={classes.textFields}
                id="specifications"
                label="Especificaciones"
                margin="normal"
                value={classPriceState.specifications[index]}
                inputProps={{
                  maxLength: 100
                }}
                onKeyPress={e => {
                  keyValidation(e, 6);
                }}
                onChange={e => {
                  pasteValidation(e, 6);
                  let newSpecifications = classPriceState.specifications;
                  newSpecifications[index] = e.target.value;
                  setClassPriceState({
                    ...classPriceState,
                    specifications: newSpecifications
                  });
                }}
              />
            </Grid>
            <Grid item md={1} xs={2}>
              {index !== 0 ? (
                <Tooltip title="Quitar período de pago">
                  <IconButton
                  onClick={() => {
                    deletePaymentInput(index);
                  }}
                >
                  <RemoveIcon style={{ color: "#D32F2F" }} />
                </IconButton>
                </Tooltip>
              ) : null}
            </Grid>
            <Grid item md={1}></Grid>
          </Grid>
        ))}
        <Grid item md={8} xs={10}>
          <Tooltip title="Agregar período de pago">
          <IconButton
            style={{ float: "right" }}
            onClick={() => {
              addPaymentInput();
            }}
          >
            <AddIcon style={{ color: "#43a047" }} />
          </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={10} md={11}>
          <Button
            variant="contained"
            disabled={disabledButton}
            className={classes.button}
            onClick={() => {
              addClassPrice();
            }}
          >
            Guardar
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackbar}
        onClose={handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackBarText}</span>}
      />
    </Card>
  );
}
