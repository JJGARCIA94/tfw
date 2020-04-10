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
  Grid,
  Tooltip,
} from "@material-ui/core";
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  EventAvailable as EventAvailableIcon,
  MonetizationOn as MonetizationOnIcon,
  Warning as WarningIcon
} from "@material-ui/icons";
//import SearchInput from "../searchInput/searchInput";
import { useQuery, useSubscription, useMutation } from "@apollo/react-hooks";
import {
  GET_USERS_BY_NAME,
  GET_USER_TYPES,
  GET_USER_TYPE_VALIDATION,
  GET_USER_BY_ID_AUTH,
} from "../../database/queries";
import { UPDATE_USER_STATUS } from "../../database/mutations";
import NotFound from "../notFound/notFound";
const jwt = require("jsonwebtoken");

//let rows = [];
let filterRows = [];

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
  return stabilizedThis.map((el) => el[0]);
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Nombre" },
  { id: "address", numeric: false, disablePadding: false, label: "Dirección" },
  {
    id: "phone_number",
    numeric: false,
    disablePadding: false,
    label: "Teléfono",
  },
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  {
    id: "user_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de usuario",
  },
  { id: "actions", numeric: false, disablePadding: false, label: "Acciones" },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
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
  rowCount: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: "auto",
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
    width: 1,
  },
  icons: {
    color: "black",
  },
  toolbartitle: {
    marginTop: theme.spacing(1),
  },
}));

export default function Users(props) {
  const classes = useStyles();
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  //const [handlePage, setHandlePage] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("0");
  const [dialog, setDialog] = useState({
    openDialog: false,
    tittleDialog: "",
    textDialog: "",
    idDialog: 0,
    idUserTypeDialog: 0,
    statusDialog: 0,
  });
  const [snackbarState, setSnackbarState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    snackbarText: "",
    snackbarColor: "",
  });
  const {
    openDialog,
    tittleDialog,
    textDialog,
    idDialog,
    idUserTypeDialog,
    statusDialog,
  } = dialog;
  const {
    vertical,
    horizontal,
    openSnackBar,
    snackbarText,
    snackbarColor,
  } = snackbarState;
  const [
    updateUserStatusMutation,
    { loading: updateUserStatusLoading, error: updateUserStatusError },
  ] = useMutation(UPDATE_USER_STATUS);
  const {
    loading: usersLoading,
    data: usersData,
    error: usersError,
  } = useSubscription(GET_USERS_BY_NAME, {
    variables: {
      userType: userType !== "0" ? userType : null,
    },
  });
  const {
    loading: userTypesLoading,
    data: userTypesData,
    error: userTypesError,
  } = useSubscription(GET_USER_TYPES);
  const {
    loading: userTypesValidationLoading,
    data: userTypesValidationData,
    userTypesValidationError,
  } = useSubscription(GET_USER_TYPE_VALIDATION, {
    variables: {
      userTypeId: idUserTypeDialog,
    },
  });
  const setUserAuthHeader = props.setUserAuth;
  const [userAuth, setUserAuth] = useState(true);
  const [userIdAuth, setUserIdAuth] = useState(0);
  const { data: userAuthData, error: userAuthError } = useQuery(
    GET_USER_BY_ID_AUTH,
    {
      variables: {
        id: userIdAuth,
      },
      onCompleted: () => {
        if (userAuthData.users.length === 0 && userIdAuth !== 0) {
          localStorage.removeItem("token");
          setUserAuth(false);
          setUserAuthHeader(false);
        }
      },
    }
  );

  useEffect(() => {
    function filterDataRows() {
      let filterData = [];
      for(let x=0 ; x<filterRows.length ; x++) {
        if(filterRows[x].name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1 ||
        filterRows[x].address.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1 ||
        filterRows[x].phone_number.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1 ||
        filterRows[x].email.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1) {
          filterData.push(filterRows[x]);
        }
      }

      return filterData;
    };

    if(search.trim() !== "") {
      setRows(filterDataRows());
    }
    else {
      setRows(filterRows);
    }
  }, [search])

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
    if (usersData) {
      filterRows = [];
      /* if (page !== 0 && !handlePage) {
      setPage(0);
    } */
      usersData.users_data.map((user, index) => {
        return user.id !== 1
          ? filterRows.push({
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              address: user.address,
              phone_number: user.phone_number,
              email: user.email,
              user_type: user.R_user_type.name,
              user_type_id: user.R_user_type.id,
              status: user.status,
            })
          : null;
      });
      setRows(filterRows);
    }
  }, [usersData]);

  if (usersLoading || userTypesLoading || userTypesValidationLoading) {
    return <CircularProgress />;
  } else if (
    usersError ||
    userTypesError ||
    userTypesValidationError ||
    userAuthError
  ) {
    return <NotFound />;
  } /* else {
    //rows = [];
    filterRows = [];
    if (page !== 0 && !handlePage) {
      setPage(0);
    }
    usersData.users_data.map((user, index) => {
      return user.id !== 1 ? filterRows.push({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        address: user.address,
        phone_number: user.phone_number,
        email: user.email,
        user_type: user.R_user_type.name,
        user_type_id: user.R_user_type.id,
        status: user.status
      }) : null;
    });
    setRows(filterRows);
  } */

  const getUserTypes = () => {
    return userTypesData.users_type.map((userType) => {
      return userType.id !== 1 ? (
        <option key={userType.id} value={userType.id}>
          {userType.name}
        </option>
      ) : null;
    });
  };

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === "desc";
    setOrder(isDesc ? "asc" : "desc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    //setHandlePage(true);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (idUsuario, idTipoUsuario, newStatus) => {
    setDialog({
      openDialog: true,
      tittleDialog:
        newStatus === 0
          ? "¿Quieres eliminar este usuario?"
          : "¿Quieres restaurar este usuario?",
      textDialog:
        newStatus === 0
          ? "Una vez eliminado, este usuario no podrá ingresar a la plataforma y se cancelarán todos sus pagos de clases y casilleros."
          : "Una vez restaurado, este usuario podrá ingresar a la plataforma.",
      idDialog: idUsuario,
      idUserTypeDialog: idTipoUsuario,
      statusDialog: newStatus,
    });
  };

  const handleCloseDialog = (agree) => {
    if (agree) {
      if (
        userTypesValidationData.users_type_aggregate.aggregate.count === 0 &&
        statusDialog === 1
      ) {
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            "No se puede restaurar porque el tipo de usuario de este usuario no está activo.",
          snackbarColor: "#d32f2f",
        });
        return;
      } else {
        updateUserStatusMutation({
          variables: {
            id: idDialog,
            newStatus: statusDialog,
          },
        });
        if (updateUserStatusLoading) return <CircularProgress />;
        if (updateUserStatusError) {
          setSnackbarState({
            ...snackbarState,
            openSnackBar: true,
            snackbarText: "Ha ocurrido un error",
            snackbarColor: "#d32f2f",
          });
          return;
        }
        setSnackbarState({
          ...snackbarState,
          openSnackBar: true,
          snackbarText:
            statusDialog === 1 ? "Usuario restaurado" : "Usuario eliminado",
          snackbarColor: "#43a047",
        });
      }
    }
    setDialog({
      openDialog: false,
      tittleDialog: "",
      textDialog: "",
      idDialog: 0,
      idUserTypeDialog: 0,
      statusDialog: 0,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarState({
      ...snackbarState,
      openSnackBar: false,
      snackbarText: "",
      snackbarColor: "",
    });
  };

  return userAuth ? (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Toolbar>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12} style={{ alignSelf: "center" }}>
              <Typography
                className={classes.toolbartitle}
                variant="h6"
                id="tableTitle"
              >
                Usuarios
                <Tooltip title="Agregar usuario">
                  <Link to="/newUser">
                    <AddCircleIcon />
                  </Link>
                </Tooltip>
              </Typography>
            </Grid>
            <Grid item md={4} xs={12}>
              {/* <SearchInput
                setSearch={setSearch}
                search={search}
                setHandle={setHandlePage}
                label="Buscar por cualquier campo"
              /> */}
              <TextField
                className={classes.textFields}
                style={{
                  width: "100%",
                }}
                id="search"
                label="Buscar por cualquier campo"
                margin="normal"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                className={classes.textFields}
                required
                select
                SelectProps={{
                  native: true,
                }}
                style={{
                  width: "100%",
                }}
                id="user_type"
                label="Selecciona un tipo de usuario"
                margin="normal"
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value);
                }}
              >
                <option value={0}>Todos los tipos de usuario</option>
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
              {rows.length > 0 ? (stableSort(rows, getSorting(order, orderBy))
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
                        <Tooltip title="Ver información">
                          <Link to={"/user/" + row.id}>
                            <IconButton>
                              <VisibilityIcon className={classes.icons} />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip
                          title={
                            row.status === 1
                              ? "Eliminar usuario"
                              : "Restaurar usuario"
                          }
                        >
                          <IconButton
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
                        </Tooltip>
                        {row.user_type_id === 2 ? (
                          <Tooltip title="Ver asistencias">
                            <Link to={"/assists/" + row.id}>
                              <IconButton>
                                <EventAvailableIcon className={classes.icons} />
                              </IconButton>
                            </Link>
                          </Tooltip>
                        ) : null}
                        {row.user_type_id === 2 ? (
                          <Tooltip title="Ver pagos">
                            <Link to={"/userPayments/" + row.id}>
                              <IconButton>
                                <MonetizationOnIcon className={classes.icons} />
                              </IconButton>
                            </Link>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })): (
                  <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="subtitle1">
                      <WarningIcon
                        style={{ color: "red", verticalAlign: "sub" }}
                      />
                      No hay usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={(e) => {
            return `${e.from}-${e.to} de ${e.count}`;
          }}
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
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={openSnackBar}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id",
          style: { background: snackbarColor },
        }}
        message={<span id="message-id">{snackbarText}</span>}
      />
    </div>
  ) : (
    <Redirect to="/login" />
  );
}
