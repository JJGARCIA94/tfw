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
  Snackbar
} from "@material-ui/core";
import {
  AddCircle as AddCircleIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreFromTrashIcon
} from "@material-ui/icons";
import { useSubscription, useQuery, useMutation } from "@apollo/react-hooks";
import {
  GET_USER_TYPES_ALL,
  GET_USER_BY_USER_TYPE
} from "../../database/queries";
import { UPDATE_USER_TYPE_STATUS } from "../../database/mutations";
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
  }
}));

export default function UserTypes() {
  const classes = useStyles();
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    statusDialog: 0
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
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const {
    data: userTypesData,
    loading: userTypesLoading,
    error: userTypesError
  } = useSubscription(GET_USER_TYPES_ALL);
  const { data: userData, loading: userLoading, error: userError } = useQuery(
    GET_USER_BY_USER_TYPE,
    {
      variables: {
        userTypeId: idDialog
      }
    }
  );
  const [
    updateUserTypeStatusMutation,
    { loading: updateUserTypeStatusLoading, error: updateUserTypeStatusError }
  ] = useMutation(UPDATE_USER_TYPE_STATUS);

  if (userLoading || userTypesLoading) {
    return <CircularProgress />;
  }
  if (userError || userTypesError) {
    return <NotFound />;
  }

  const handleOpenDialog = (idUsuario, newStatus) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "Do you want to delete this user type?"
          : "Do you want to restore this user type?",
      textDialog:
        newStatus === 0
          ? "Once deleted, this user type will not be available to select when create or update a user."
          : "Once restored, this user type will be available to select when create or update a user.",
      idDialog: idUsuario,
      statusDialog: newStatus
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      if (
        userData.users_data_aggregate.aggregate.count > 0 &&
        statusDialog === 0
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText: "It can´t be remove because there are users with this user type.",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateUserTypeStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog
          }
        });
        if (updateUserTypeStatusLoading) return <CircularProgress />;
        if (updateUserTypeStatusError) {
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
          snackbarText:
            statusDialog === 1 ? "User type restored" : "User type deleted",
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

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: ""
    });
  };

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Toolbar>
        <Grid container>
          <Grid item md={8} xs={12}>
            <Typography variant="h6" id="tableTitle">
              User types
              <Link to="/newUserType">
                <AddCircleIcon />
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userTypesData.users_type.map(row => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">
                <Link to={"/userType/" + row.id}>
                  <IconButton title="See user type">
                    <VisibilityIcon className={classes.icons} />
                  </IconButton>
                </Link>
                <IconButton
                  title={
                    row.status === 1 ? "Delete user type" : "Restore user type"
                  }
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
            Disagree
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog(true);
            }}
            color="primary"
            autoFocus
          >
            Agree
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
