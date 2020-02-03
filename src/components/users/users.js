import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  TextField,
  Grid
} from "@material-ui/core";
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  EventAvailable as EventAvailableIcon,
  MonetizationOn as MonetizationOnIcon
} from "@material-ui/icons";
import SearchInput from "../searchInput/searchInput";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_USERS_BY_NAME,
  GET_USER_TYPES,
  GET_USER_TYPE_VALIDATION,
  GET_USER_BY_ID_AUTH
} from "../../database/queries";
import { UPDATE_USER_STATUS } from "../../database/mutations";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

let rows = [];

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Name" },
  { id: "address", numeric: false, disablePadding: false, label: "Addres" },
  {
    id: "phone_number",
    numeric: false,
    disablePadding: false,
    label: "Phone number"
  },
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  {
    id: "user_type",
    numeric: false,
    disablePadding: false,
    label: "User type"
  },
  { id: "actions", numeric: false, disablePadding: false, label: "Actions" }
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map(headCell => (
          <TableCell
            style={{ fontStyle: "bold" }}
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  tableWrapper: {
    overflowX: "auto"
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  },
  icons: {
    color: "black"
  },
  toolbartitle: {
    marginTop: theme.spacing(1)
  }
}));

export default function Users(props) {
  const classes = useStyles();
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");
  const [page, setPage] = useState(0);
  const [handlePage, setHandlePage] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("0");
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    idUserTypeDialog: 0,
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
    idUserTypeDialog,
    statusDialog
  } = dialog;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor
  } = snackbarState;
  const [
    updateUserStatusMutation,
    { loading: updateUserStatusLoading, error: updateUserStatusError }
  ] = useMutation(UPDATE_USER_STATUS);
  const {
    loading: usersLoading,
    data: usersData,
    error: usersError
  } = useSubscription(GET_USERS_BY_NAME, {
    variables: {
      search: `%${search}%`,
      userType: userType !== "0" ? userType : null
    }
  });
  const {
    loading: userTypesLoading,
    data: userTypesData,
    error: userTypesError
  } = useSubscription(GET_USER_TYPES);
  const {
    loading: userTypesValidationLoading,
    data: userTypesValidationData,
    userTypesValidationError
  } = useSubscription(GET_USER_TYPE_VALIDATION, {
    variables: {
      userTypeId: idUserTypeDialog
    }
  });
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const {
    data: userAuthData, error: userAuthError
  } = useQuery(GET_USER_BY_ID_AUTH, {
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
  });

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

  if (usersLoading || userTypesLoading || userTypesValidationLoading) {
    return <CircularProgress />;
  } else if (usersError || userTypesError || userTypesValidationError || userAuthError) {
    return <NotFound />;
  } else {
    rows = [];
    if (page !== 0 && !handlePage) {
      setPage(0);
    }
    usersData.users_data.map((user, index) => {
      return rows.push({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        address: user.address,
        phone_number: user.phone_number,
        email: user.email,
        user_type: user.R_user_type.name,
        user_type_id: user.R_user_type.id,
        status: user.status
      });
    });
  }

  const getUserTypes = () => {
    return userTypesData.users_type.map(userType => {
      return (
        <option key={userType.id} value={userType.id}>
          {userType.name}
        </option>
      );
    });
  };

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setHandlePage(true);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (idUsuario, idTipoUsuario, newStatus) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "Do you want to delete this user?"
          : "Do you want to restore this user?",
      textDialog:
        newStatus === 0
          ? "Once deleted, this user will not be able to enter the platform."
          : "Once restored, this user will be able to enter the platform.",
      idDialog: idUsuario,
      idUserTypeDialog: idTipoUsuario,
      statusDialog: newStatus
    });
  };

  const handleCloseDialog = agree => {
    if (agree) {
      if (
        userTypesValidationData.users_type_aggregate.aggregate.count === 0 &&
        statusDialog === 1
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "It can´t be restore because the user type of this user doesn´t be active.",
          snackbarColor: "#d32f2f"
        });
        return;
      } else {
        updateUserStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog
          }
        });
        if (updateUserStatusLoading) return <CircularProgress />;
        if (updateUserStatusError) {
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
          snackbarText: statusDialog === 1 ? "User restored" : "User deleted",
          snackbarColor: "#43a047"
        });
      }
    }
    setDialog({
      openDialog: false,
      tittleDialog: "",
      textDialog: "",
      idDialog: 0,
      idUserTypeDialog: 0,
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
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return ( userAuth ?
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Toolbar>
          <Grid container>
            <Grid item md={8} xs={6}>
              <Typography
                className={classes.toolbartitle}
                variant="h6"
                id="tableTitle"
              >
                Users
                <Link to="/newUser">
                  <AddCircleIcon />
                </Link>
              </Typography>
            </Grid>
            <Grid item md={2} xs={6}>
              <SearchInput
                setSearch={setSearch}
                search={search}
                setHandle={setHandlePage}
                label="Search by any field"
              />
            </Grid>
            <Grid item md={2} xs={12}>
              <TextField
                className={classes.textFields}
                required
                select
                SelectProps={{
                  native: true
                }}
                style={{
                  width: "100%"
                }}
                id="user_type"
                label="Select a user type to search"
                margin="normal"
                value={userType}
                onChange={e => {
                  setUserType(e.target.value);
                }}
              >
                <option value={0}>All user types</option>
                {getUserTypes()}
              </TextField>
            </Grid>
          </Grid>
        </Toolbar>
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
            style={{ overflowX: "scroll" }}
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.address}</TableCell>
                      <TableCell align="left">{row.phone_number}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">{row.user_type}</TableCell>
                      <TableCell align="left">
                        <Link to={"/user/" + row.id}>
                          <IconButton title="See user">
                            <VisibilityIcon className={classes.icons} />
                          </IconButton>
                        </Link>
                        <IconButton
                          title={
                            row.status === 1 ? "Delete user" : "Restore user"
                          }
                          onClick={() => {
                            const newStatus = row.status === 1 ? 0 : 1;
                            handleOpenDialog(
                              row.id,
                              row.user_type_id,
                              newStatus
                            );
                          }}
                        >
                          {row.status === 1 ? (
                            <DeleteIcon className={classes.icons} />
                          ) : (
                            <RestoreFromTrashIcon className={classes.icons} />
                          )}
                        </IconButton>
                        {row.user_type_id === 2 ? (
                          <Link to={"/assists/" + row.id}>
                            <IconButton title="Check assists">
                              <EventAvailableIcon className={classes.icons} />
                            </IconButton>
                          </Link>
                        ) : null}
                        {row.user_type_id === 2 ? (
                          <Link to={"/userPayments/" + row.id}>
                            <IconButton title="Pagos de cliente">
                              <MonetizationOnIcon className={classes.icons} />
                            </IconButton>
                          </Link>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
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
    </div> : <Redirect to="/login" />
  );
}
