import React from "react";
import {
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSubscription } from "@apollo/react-hooks";
import { GET_CLASSES_PRICE_BY_STATUS } from "../../database/queries";
import NotFound from "../notFound/notFound";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(3),
  },
  root: {
    padding: theme.spacing(3, 2),
    width: "100%",
  },
  cards: {
    margin: "10px",
    height: "250px",
    overflowY: "auto",
    overflowX: "auto",
  },
  cardContent: {
    textAlign: "justify",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function Step1(props) {
  const classes = useStyles();
  const selected = props.selected;
  const setSelected = props.setSelected;
  const setClassPriceState = props.setClassPriceState;
  const selectedInformationState = props.selectedInformationState;
  const setSelectedInformationState = props.setSelectedInformationState;
  const setSelectedClassesState = props.setSelectedClassesState;
  const {
    data: classesPriceData,
    loading: classesPriceLoading,
    error: classesPriceError,
  } = useSubscription(GET_CLASSES_PRICE_BY_STATUS);

  if (classesPriceLoading) {
    return <CircularProgress />;
  }
  if (classesPriceError) {
    return <NotFound />;
  }

  const getClassesPrice = () => {
    return classesPriceData.classes_price.map((class_price, index) => {
      return (
        <Grid item xs={12} md={6} lg={4} key={class_price.id}>
          <CardActionArea
            onClick={() => {
              setSelected(selected === index ? -1 : index);
              setClassPriceState(class_price.id);
              setSelectedInformationState({
                ...selectedInformationState,
                package_name:
                  class_price.name !== null && class_price.name.trim() !== ""
                    ? class_price.name
                    : "",
                classes: class_price.R_classes_price_details.map(
                  (aClass, index) =>
                    `${aClass.R_classes.name}${
                      class_price.R_classes_price_details.length !== index + 1
                        ? ","
                        : "."
                    } `
                ),
              });
              let classesId = [];
              class_price.R_classes_price_details.map((aClass) =>
                classesId.push(aClass.classes_id)
              );
              setSelectedClassesState({
                ids: classesId,
              });
            }}
          >
            <Card
              className={classes.cards}
              style={{
                background: selected === index ? "#eeeeee" : "white",
                border: selected === index ? "1px solid black" : "",
              }}
            >
              <CardContent>
                <Typography
                  style={{
                    background: "#ebebeb",
                    marginBottom: "10px",
                    textAlign: "end",
                  }}
                ></Typography>
                <Typography variant="subtitle1" className={classes.cardContent}>
                  {class_price.name !== null &&
                  class_price.name.trim() !== "" ? (
                    <span>
                      <strong>Nombre de paquete: </strong>
                      {class_price.name}
                    </span>
                  ) : null}
                </Typography>
                <Typography variant="subtitle1" className={classes.cardContent}>
                  <strong>Clase(s): </strong>
                  {class_price.R_classes_price_details.map((aClass, index) => (
                    <span key={index}>{`${aClass.R_classes.name} (${
                      aClass.R_classes.R_users_data.first_name
                    } ${aClass.R_classes.R_users_data.last_name})${
                      class_price.R_classes_price_details.length !== index + 1
                        ? ","
                        : "."
                    } `}</span>
                  ))}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Grid>
      );
    });
  };
  return <Grid container>{getClassesPrice()}</Grid>;
}
