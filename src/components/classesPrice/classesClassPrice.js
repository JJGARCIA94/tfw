import React, { useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  TextField,
  Tooltip
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreFromTrashIcon
} from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_CLASSES_BY_CLASS_PRICE_ID,
  GET_CLASSES_PRICE_DETAILS_COUNT_BY_CLASS_PRICE_ID,
  GET_CLASSES_NOT_IN_BY_CLASS_ID
} from "../../database/queries";
import {
  UPDATE_CLASSES_PRICE_DETAILS_STATUS,
  ADD_CLASS_PRICE_DETAILS
} from "../../database/mutations";
import NotFound from "../notFound/notFound";

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  title: {
    marginTop: theme.spacing(1)
  },
  icons: {
    color: "black"
  },
  textFields: {
    width: "100%"
  }
}));

export default function ClassesClassPrice(props) {
  const classes = useStyles();
  const classPriceId = props.match.params.classPriceId;
  const [idClassesExistState, setIdClassesExistState] = useState([]);
  const [newClassState, setNewClassState] = useState(0);
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    statusDialog: 0
  });
  const [dialogAddClass, setDialogAddClass] = useState({
    openDialogAddClass: false,
    tittleDialogAddClass: ""
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: ""
  });
  const {
    openDialog,
    tittleDialog,
    textDialog,
    idDialog,
    statusDialog
  } = dialog;
  const { openDialogAddClass, tittleDialogAddClass } = dialogAddClass;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError
  } = useSubscription(GET_CLASSES_BY_CLASS_PRICE_ID, {
    variables: {
      classPriceId: classPriceId
    }
  });
  const {
    data: classesCountData,
    loading: classesCountLoading,
    error: classesCountError
  } = useSubscription(GET_CLASSES_PRICE_DETAILS_COUNT_BY_CLASS_PRICE_ID, {
    variables: {
      classPriceId: classPriceId
    }
  });
  const {
    data: classesNotInData,
    loading: classesNotInLoading,
    error: classesNotInError
  } = useSubscription(GET_CLASSES_NOT_IN_BY_CLASS_ID, {
    variables: {
      idClasses: idClassesExistState
    }
  });
  const [
    updateClassesPriceDetailsStatusMutation,
    {
      loading: updateClassesPriceDetailsStatusLoading,
      error: updateClassesPriceDetailsStatusError
    }
  ] = useMutation(UPDATE_CLASSES_PRICE_DETAILS_STATUS);

  const [
    addClassPriceDetailsMutation,
    { loading: addClassPriceDetailsLoading, error: addClassPriceDetailsError }
  ] = useMutation(ADD_CLASS_PRICE_DETAILS);

  if (classesLoading || classesCountLoading || classesNotInLoading) {
    return <CircularProgress />;
  }
  if (classesError || classesCountError || classesNotInError || classesData.classes_price_details.length === 0) {
    return <NotFound />;
  }

  const handleOpenDialog = (idTipoUsuario, newStatus) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "¿Quieres eliminar esta clase?"
          : "¿Quieres restaurar esta clase?",
      textDialog:
        newStatus === 0
          ? "Una vez eliminada ya no estará disponible dentro de esta clase o paquete."
          : "Una vez restaurada estará disponible dentro de esta clase o paquete.",
      idDialog: idTipoUsuario,
      statusDialog: newStatus
    });
  };

  const handleOpenDialogAddClass = () => {
    setDialogAddClass({
      openDialogAddClass: true,
      tittleDialogAddClass: "Agregar Clase"
    });
    let idClassesExist = [];
    for (let x = 0; x < classesData.classes_price_details.length; x++) {
      idClassesExist.push(classesData.classes_price_details[x].classes_id);
    }
    setIdClassesExistState(idClassesExist);
  };

  const handleCloseDialog = agree => {
    if (agree) {
      if (
        classesCountData.classes_price_details_aggregate.aggregate.count <= 1 &&
        statusDialog === 0
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Tiene que haber por lo menos una clase activa",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateClassesPriceDetailsStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog
          }
        });
        if (updateClassesPriceDetailsStatusLoading) return <CircularProgress />;
        if (updateClassesPriceDetailsStatusError) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ha ocurrido un error",
            snackbarColor: "#d32f2f"
          });
          return;
        }
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            statusDialog === 1 ? "Clase restaurada" : "Clase eliminada",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialog({
      openDialog: false,
      tittleDialog: "",
      textDialog: "",
      idDialog: 0,
      statusDialog: 0
    });
  };

  const handleCloseDialogAddClass = agree => {
    if (agree) {
      if (newClassState === 0 || newClassState === "0") {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Selecciona una clase",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        addClassPriceDetailsMutation({
          variables: {
            classPriceId: classPriceId,
            classId: newClassState
          }
        });

        if (addClassPriceDetailsLoading) {
          return <CircularProgress />;
        }
        if (addClassPriceDetailsError) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ha ocurrido un error",
            snackbarColor: "#d32f2f"
          });
          return;
        }
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "Clase agregada",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialogAddClass({
      openDialogAddClass: false,
      tittleDialogAddClass: ""
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: ""
    });
  };

  const getClassesNotExistInClassPrice = () => {
    return classesNotInData.classes.length === 0 ? (
      <option value="0">
        No hay clases para agregar
      </option>
    ) : (
      classesNotInData.classes.map(aClass => {
        return (
          <option key={aClass.id} value={aClass.id}>
            {`${aClass.name} (${aClass.R_users_data.first_name} ${aClass.R_users_data.last_name})`}
          </option>
        );
      })
    );
  };

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Toolbar>
        <Grid container>
          <Grid item md={8} xs={12}>
            <Typography variant="h6" id="tableTitle">
              <Tooltip title="Regresar">
              <Link to={"/classesPrice"}>
                <ArrowBackIcon />
              </Link>
              </Tooltip>
              <span style={{ marginLeft: "10px" }}>Clase(s)</span>
              <Tooltip title="Agregar clase">
              <IconButton
                onClick={() => {
                  handleOpenDialogAddClass();
                }}
              >
                <AddCircleIcon style={{ color: "#007bff" }} />
              </IconButton>
              </Tooltip>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classesData.classes_price_details.map(row => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.R_classes.name}
              </TableCell>
              <TableCell align="right">
                <Tooltip title={
                    row.status === 1 ? "Eliminar clase" : "Restaurar clase"
                  }>
                <IconButton
                  onClick={() => {
                    const newStatus = row.status === 1 ? 0 : 1;
                    handleOpenDialog(row.id, newStatus);
                  }}
                >
                  {row.status === 1 ? (
                    <DeleteIcon className={classes.icons} />
                  ) : (
                    <RestoreFromTrashIcon className={classes.icons} />
                  )}
                </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={openDialog}
        onClose={() => {
          handleCloseDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{tittleDialog}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {textDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogAddClass}
        onClose={() => {
          handleCloseDialogAddClass(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {tittleDialogAddClass}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Clase"
            className={classes.textFields}
            SelectProps={{
              native: true
            }}
            value={newClassState}
            margin="normal"
            onChange={e => {
              setNewClassState(e.target.value);
            }}
          >
            <option value="0">Selecciona una clase</option>
            {getClassesNotExistInClassPrice()}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialogAddClass(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleCloseDialogAddClass(true);
            }}
            color="primary"
            autoFocus
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
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
    </TableContainer>
  );
}
