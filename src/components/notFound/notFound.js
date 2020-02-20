import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Error as ErrorIcon } from "@material-ui/icons";
import { Grid, Typography, Card, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    width: "fit-content",
    marginTop: "10%"
  },
  container: {
    padding: theme.spacing(3, 2)
  },
  icon: {
    color: "#D32F2F",
    fontSize: 100
  },
  items: {
    marginTop: "20px"
  },
  button: {
      marginBottom: "20px"
  }
}));

export default function NotFound() {
  const classes = useStyles();
  return (
    <center>
      <Card className={classes.root}>
        <Grid container className={classes.container}>
          <Grid item xs={12} className={classes.items}>
            <ErrorIcon className={classes.icon} />
          </Grid>
          <Grid item xs={12} className={classes.items}>
            <Typography variant="h3">¡Pagina no encontrada!</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">
            No se encontró la página que solicitó.
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.items}>
            <Link to="/">
              <Button variant="contained" color="primary" className={classes.button}>
                Ir a Home
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Card>
    </center>
  );
}
