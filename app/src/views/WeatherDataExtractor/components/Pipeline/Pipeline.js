import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Grid, Button, TextField, Fab, LinearProgress, CircularProgress, Modal, Card, CardContent, CardActions } from '@material-ui/core';
import { genericFunctionTwoParameters, genericFunctionThreeParameters,process } from '../../../../utils/API';
import { endpoint_request_id_all, endpoint_fetch_geo_points,endpoint_power_nasa_api_call } from '../../../../configs/endpoints';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
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
    width: '45%',
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%'
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [output, setOutput] = useState({ status: null, message: "" });
  const [requests, setRequests] = useState(false);
  const [values, setValues] = useState([]);
  const [data, setData] = useState([]);
  const [unprocessed_data, setUnprocessedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  useEffect(() => {
    let mounted_requests = true;

    /** get request ids */
    (async (endpoint, desc) => {
      await genericFunctionTwoParameters(endpoint, desc)
        .then(response => {
          if (mounted_requests) {
            setRequests(response.payload);
          }
        });
    })(endpoint_request_id_all, 'event-calving-validation');

    return () => {
      mounted_requests = false;
    };
  }, []);

  if (!requests) {
    return null;
  }



  const handleChange = event => {
    event.persist();
    setValues({
      ...values,
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });


    if (event.target.name === 'request_id' && event.target.value === "") {
      setUnprocessedData([]);
      setData([]);
      setDataLoaded(false);
    }

    if (event.target.name === 'request_id' && event.target.value !== "") {
      setIsLoading(true);
      setUnprocessedData([]);
      setData([]);
      setDataLoaded(false);

      (async (endpoint, desc, id) => {
        await genericFunctionThreeParameters(endpoint, desc, id)
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
      })(endpoint_fetch_geo_points, 'get data', event.target.value);

    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!loading) {
      setSuccess(false);
      setLoading(true);
    }

    let start_date =  moment(values.start_date).format("YYYYMMDD");
    let end_date = moment(values.end_date).format("YYYYMMDD");
      
      //for (let r = 0; r<unprocessed_data.length; r++){
      for (let r = 0; r<5; r++){
        let longitude = unprocessed_data[r].longitude; 
        let latitude = unprocessed_data[r].latitude; 
        let rec_id  = unprocessed_data[r].id;

        (async (config,rec_id,long,lat,start_date,end_date) => {
          await process(config,rec_id,long,lat,start_date,end_date)
            .then(() => {             
            }).catch((error) => {
              setOutput({ status: 0, message: error.message })
              setSuccess(false);
              setLoading(false);
            });
        })(endpoint_power_nasa_api_call,rec_id,longitude,latitude,start_date,end_date);
        
       } 
       
       setLoading(false);
       setOutput({ status: 1, message: 'finised processing' });    
  };

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



  const columns = [
    { name: "id", label: "RECORD ID", options: { filter: false, sort: true, display: true } },
    { name: "longitude", label: "LONGITUDE", options: { filter: false, sort: true, display: true } },
    { name: "latitude", label: "LATITUDE", options: { filter: false, sort: true, display: true } },
    { name: "processed", label: "PROCESSED", options: { filter: false, sort: true, display: true } },
  ];



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
                    spacing={2} justify="center"
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
                        label="SELECT REQUEST"
                        name="request_id"
                        onChange={handleChange}
                        select
                        // eslint-disable-next-line react/jsx-sort-props
                        SelectProps={{ native: true }}
                        variant="outlined"
                      >
                        <option value=""></option>
                        {requests.map(request => (
                          <option
                            value={request.id}
                          >
                            {`#${request.id}`}
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
                        label="START DATE"
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
                        label="END DATE"
                        type="date"
                        name="end_date"
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    </Grid>

                    <br/>
                    
                    <Grid container   spacing={4} >
                    

                      <Grid item md={12} xs={12} >
                        {isLoading &&
                          <LinearProgress />
                        }
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
                              {success ? <CheckIcon /> : <SettingsIcon />}
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
                              EXECUTE
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
