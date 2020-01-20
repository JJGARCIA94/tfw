import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  Toolbar,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Snackbar,
  CircularProgress
} from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import Step1 from "./step1";
import NotFound from "../notFound/notFound";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import { ADD_USER_PAYMENT } from "../../database/mutations";
import { GET_USER_NAME_BY_USER_ID } from "../../database/queries";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(3)
  },
  root: {
    padding: theme.spacing(3, 2),
    width: "100%"
  },
  cards: {
    margin: "10px",
    height: "250px",
    overflowY: "auto",
    overflowX: "auto"
  },
  cardContent: {
    textAlign: "justify"
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function getSteps() {
  return [
    "Selección de clase o paquete",
    "Selección de período de pago",
    "Descuento y próximo pago",
    "Confirmación de pago"
  ];
}

export default function NewUserPayment(props) {
  const classes = useStyles();
  const userId = props.match.params.userId;
  const [selectedInformationState, setSelectedInformationState] = useState({
    package_name: "",
    classes: "",
    specifications: "",
    payment_period: "",
    amount: 0
  });
  const [classPriceState, setClassPriceState] = useState(0);
  const [paymentPeriodState, setPaymentPeriodState] = useState({
    id: 0,
    days: 0
  });
  const now = new Date(Date.now());
  const [userPaymentState, setUserPaymentState] = useState({
    discount_percent: 0,
    total: 0,
    payment_start: now.toLocaleDateString("en-US"),
    payment_end: now.toLocaleDateString("en-US")
  });
  const [originalTotalState, setOriginalTotalState] = useState(0);
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const [selectedStep1, setSelectedStep1] = useState(-1);
  const [selectedStep2, setSelectedStep2] = useState(-1);
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const [
    addUserPaymentMutation,
    {
      loading: addUserPaymentMutationLoading,
      error: addUserPaymentMutationError
    }
  ] = useMutation(ADD_USER_PAYMENT);
  const {
    loading: userNameLoading,
    data: userNameData,
    error: userNameError
  } = useSubscription(GET_USER_NAME_BY_USER_ID, {
    variables: {
      userid: userId
    }
  });

  if (userNameLoading) {
    return <CircularProgress />;
  }
  if (userNameError) {
    return <NotFound />;
  }

  const getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return (
          <Step1
            selected={selectedStep1}
            setSelected={setSelectedStep1}
            selectedInformationState={selectedInformationState}
            setSelectedInformationState={setSelectedInformationState}
            setClassPriceState={setClassPriceState}
          />
        );
      case 1:
        return (
          <Step2
            selected={selectedStep2}
            setSelected={setSelectedStep2}
            selectedInformationState={selectedInformationState}
            setSelectedInformationState={setSelectedInformationState}
            classPriceState={classPriceState}
            setPaymentPeriodState={setPaymentPeriodState}
            userPaymentState={userPaymentState}
            setUserPaymentState={setUserPaymentState}
            setOriginalTotalState={setOriginalTotalState}
          />
        );
      case 2:
        return (
          <Step3
            paymentPeriodState={paymentPeriodState}
            userPaymentState={userPaymentState}
            setUserPaymentState={setUserPaymentState}
            originalTotalState={originalTotalState}
          />
        );
      case 3:
        return (
          <Step4
            userNameData={userNameData}
            selectedInformationState={selectedInformationState}
            userPaymentState={userPaymentState}
          />
        );
      default:
        return <NotFound />;
    }
  };

  const resetValues = () => {
    setSelectedInformationState({
        package_name: "",
        classes: "",
        specifications: "",
        payment_period: "",
        amount: 0
    });
    setClassPriceState(0);
    setPaymentPeriodState({
        id: 0,
        days: 0
    });
    setUserPaymentState({
        discount_percent: 0,
        total: 0,
        payment_start: now.toLocaleDateString("en-US"),
        payment_end: now.toLocaleDateString("en-US")
    });
    setOriginalTotalState(0);
    setSelectedStep1(-1);
    setSelectedStep2(-1);
  }

  const addUserPayment = () => {
    addUserPaymentMutation({
        variables: {
          userId: userId,
          classesPricePaymentPeriodId: paymentPeriodState.id,
          discountPercent: parseInt(userPaymentState.discount_percent),
          total: userPaymentState.total,
          paymentStart: userPaymentState.payment_start,
          paymentEnd: userPaymentState.payment_end
        }
      });

      if (addUserPaymentMutationLoading) return <CircularProgress />;
      if (addUserPaymentMutationError) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "An error occurred",
          snackbarColor: "#d32f2f"
        });
        return;
      }

      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText: "Pago de usuario agregado",
        snackbarColor: "#43a047"
      });
  }

  const handleNext = () => {
    if (activeStep === 0 && selectedStep1 === -1) {
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText: "Selecciona una clase o paquete",
        snackbarColor: "#d32f2f"
      });
    } else if (activeStep === 1 && selectedStep2 === -1) {
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText: "Selecciona un periodo de pago",
        snackbarColor: "#d32f2f"
      });
    }
    else if(activeStep === 2 && (userPaymentState.discount_percent === "" || userPaymentState.discount_percent === null)) {
      setSnackbarState({
        ...snackbarState,
        openSnackBar: true,
        snackbarText: "Agrega un descuento",
        snackbarColor: "#d32f2f"
      });
    }
    else {
      if (activeStep === 3) {
        addUserPayment();
      }
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setSelectedStep2(-1);
      setPaymentPeriodState({
        id: 0,
        days: 0
      });
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    resetValues();
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: ""
    });
  };

  return (
    <Card>
      <Toolbar>
        <Typography variant="h6">
          Pagos de usuario
          <Link to="/users">
            <ArrowBackIcon />
          </Link>
        </Typography>
      </Toolbar>
      <div className={classes.root}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <Button onClick={handleReset}>Agregar otro pago</Button>
          ) : (
            <div>
              <Grid container>{getStepContent(activeStep)}</Grid>
              <div>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.backButton}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackBar}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor }
        }}
        message={<span id="message-id">{snackbarText}</span>}
      />
    </Card>
  );
}
