import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Grid, Button, TextField, Fab, CircularProgress, Modal, Card, CardContent, CardActions, LinearProgress } from '@material-ui/core';
import { process, genericFunctionTwoParameters, genericFunctionThreeParameters } from '../../../../utils/API';
import { endpoint_request_id_all, endpoint_fetch_geo_points, endpoint_power_nasa_api_call } from '../../../../configs/endpoints';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: '40%',
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
    padding: theme.spacing(3)
  },
  container: {
    marginTop: theme.spacing(3)
  },
  actions: {
    justifyContent: 'flex-end'
  },
  details: {
    color: 'green'
  },

  removeBotton: {
    width: '100%'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }

}));


const getMuiTheme = () => createMuiTheme({
  overrides: {
    MUIDataTableBodyCell: {
      root: {
        backgroundColor: "#FFF",
        width: "150px"
      }
    }
  }
});

const Pipeline = props => {
  const { open, onClose, className, ...rest } = props;
  const classes = useStyles();
  const [values, setValues] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [unprocessedData, setUnprocessedData] = useState([]);
  const [requestIds, setRequestIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [output, setOutput] = useState({ status: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  useEffect(() => {
    let mounted = true;
    (async (endpoint, desc) => {
      await genericFunctionTwoParameters(endpoint, desc)
        .then(response => {
          if (mounted) {
            setRequestIds(response.payload);
          }
        });
    })(endpoint_request_id_all, 'view all request ids');

    return () => {
      mounted = false;
    }
  }, []);


  if (!requestIds) {
    return null;
  }



  const columns = [
    { name: "id", label: "id", options: { filter: false, sort: false, display: false } },
    { name: "uuid", label: "uuid", options: { filter: false, sort: true, display: false } },
    { name: "latitude", label: "Latitude", options: { filter: false, sort: true, display: true } },
    { name: "longitude", label: "Longitude", options: { filter: false, sort: true, display: true } },
    { name: "processed", label: "Processed", options: { filter: false, sort: true, display: true } }
  ];


  const options = {
    filter: false,
    download: false,
    viewColumns: false,
    search: false,
    print: false,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 20, 50, 100],
    selectableRows: 'none',
    filterType: 'checkbox',
    responsive: 'stacked',
    rowHover: true,
    setTableProps: () => {
      return {
        padding: "none",
        size: "small",
      };
    }
  };

  async function fetch_get_points(endpoint, desc, uuid) {

    setDataLoaded(false);
    setIsLoading(false);

    await genericFunctionThreeParameters(endpoint, desc, uuid)
      .then(response => {
        setData(response.payload);
        setDataLoaded(true);
        setIsLoading(false);

        let unprocessed = [];
        for (let i = 0; i < response.payload.length; i++) {
          if (response.payload[i].processed === 0) {
            unprocessed.push(response.payload[i]);
          }
        }
        setUnprocessedData(unprocessed);
      });
  };





  const handleChange = event => {
    event.persist();
    setValues({
      ...values,
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });

    if (event.target.name === 'uuid' && event.target.value !== '') {
      setData([]);
      fetch_get_points(endpoint_fetch_geo_points, 'view all request ids', event.target.value);
      setDataLoaded(true);
    }

    if (event.target.name === 'uuid' && event.target.value === '') {
      setData([]);
      setDataLoaded(false);
    }


  };

  function process_points(endpoint, rec_id, long, lat, start_date, end_date, uuid) {
    process(endpoint, rec_id, long, lat, start_date, end_date, uuid)
      .then(response => {
        setData(response.payload);
        setDataLoaded(true);
        setIsLoading(false);
      }).catch((error) => {
        setOutput({ status: 0, message: error.message });
        setSuccess(false);
        setLoading(false);
      });
      return 1;
  };





  const handleSubmit = event => {

    event.preventDefault();
    setOutput({ status: null, message: null });

    let rec_id = null;
    let latitude = null;
    let longitude = null;
    //let start_date = moment(values.start_date).format("YYYYMMDD");
    //let end_date = moment(values.end_date).format("YYYYMMDD");
    let start_date = moment('2016-01-01').format("YYYYMMDD");
    let end_date = moment('2021-08-10').format("YYYYMMDD");
    let uuid = values.uuid;

    if (values.start_date > values.end_date) {
      setOutput({ status: 0, message: 'Error in dates. start date cannot come after end date' });
    } else {

      if (!loading) {
        setSuccess(false);
        setLoading(true);
      }

      let counter_length = unprocessedData.length;
      let counter = 0;
   

      while( counter < counter_length) {    

        rec_id = unprocessedData[counter].id;
        latitude = unprocessedData[counter].latitude;
        longitude = unprocessedData[counter].longitude;       

        process_points(endpoint_power_nasa_api_call, rec_id, longitude, latitude, start_date, end_date, uuid);
        counter++;

        if ((counter + 1) === counter_length) {
          setOutput({ status: 1, message: "processing is complete" });
          setSuccess(true);
          setLoading(false);
        }

      }

    }

  };


  if (!open) {
    return null;
  }


  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <form>
          <CardContent>
            {isLoading && <LinearProgress />}
            <Grid container spacing={1} justify="center">
              <Grid item xs={12}>
                <form onSubmit={handleSubmit} id="event">
                  {
                    output.status === 0 ?
                      <>
                        <Alert severity="error" >{output.message}</Alert>
                      </>
                      : output.status === 1 ?
                        <>
                          <Alert severity="success" >{output.message}</Alert>
                        </>
                        : null
                  }
                  <br />

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      item
                      md={4}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true
                        }}
                        required
                        label="Select Request ID"
                        name="uuid"
                        onChange={handleChange}
                        select
                        SelectProps={{ native: true }}
                        variant="outlined"
                      >
                        <option value=""></option>
                        {requestIds.map(ids => (
                          <option
                            value={ids.uuid}
                          >
                            {`#${ids.id}`}
                          </option>
                        ))
                        }
                      </TextField>

                    </Grid>

                    <Grid
                      item
                      md={4}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          max: moment(new Date()).format('YYYY-MM-DD')
                        }}
                        label="Start Date"
                        type="date"
                        name="start_date"
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid
                      item
                      md={4}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          max: moment(new Date()).format('YYYY-MM-DD')
                        }}
                        label="End Date"
                        type="date"
                        name="end_date"
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>

                  </Grid>
                  <br /> <br />
                  <Grid container >
                    <Grid item md={12} xs={12} >
                      {dataLoaded &&
                        <div>
                          <PerfectScrollbar>
                            <MuiThemeProvider theme={getMuiTheme()}>
                              <MUIDataTable
                                title=""
                                data={data}
                                columns={columns}
                                options={options}
                              />
                            </MuiThemeProvider>
                          </PerfectScrollbar>
                        </div>
                      }
                    </Grid>
                  </Grid>

                  <br />
                  {dataLoaded &&
                    <Card style={{ border: "none", boxShadow: "none" }}>
                      <CardActions>
                        <>
                          <div className={classes.wrapper}>
                            <Fab
                              color="primary"
                              aria-label="save"
                              className={buttonClassname}
                            >
                              {success ? <CheckIcon /> : <SaveIcon />}
                            </Fab>
                            {loading && <CircularProgress size={68} className={classes.fabProgress} />}
                          </div>

                          <div className={classes.wrapper}>
                            <Button
                              variant="contained"
                              color="primary"
                              className={buttonClassname}
                              disabled={loading}
                              type="submit"
                            >
                              process
                            </Button>
                            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                          </div>
                        </>
                      </CardActions>
                    </Card>
                  }
                </form>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button
              className={classes.saveButton}
              onClick={onClose}
              variant="contained"
            >
              Close
            </Button>
          </CardActions>
        </form>
      </Card>
    </Modal>
  );
};
Pipeline.displayName = 'Pipeline';

Pipeline.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

Pipeline.defaultProps = {
  open: false,
  onClose: () => { }
};

export default Pipeline;
