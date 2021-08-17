import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Modal, Card, Grid, TextField, LinearProgress, CardContent, CardActions, Button, colors } from '@material-ui/core';
import { genericFunctionFiveParameters } from '../../../../utils/API';
import { endpoint_animals_by_type } from '../../../../configs/endpoints';
import authContext from '../../../../contexts/AuthContext';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: '70%',
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
  saveButton: {
    color: theme.palette.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  }
}));

const AnimalModal = props => {
  const { open, onClose, parentType, className, option,animal_id, ...rest } = props;
  const classes = useStyles();
  const [values, setValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [{ user_id }] = useContext(authContext);
  const [output, setOutput] = useState({ status: null, message: "" });

  useEffect(() => {
    let mounted = true;
    setOutput({ status: null, message: '' });
    setData([]);
    setValues([]);
    setIsLoading(true);

    (async (endpoint, desc, org, type, option) => {
      await genericFunctionFiveParameters(endpoint, desc, org, type, option)
        .then(response => {
          if (mounted) {
            var data = response.payload[0].filter(function(x) { return x.animal_id !== animal_id; }); 
            setValues(data);
            setIsLoading(false);
          }
        });
    })(endpoint_animals_by_type, 'Animal by Type', user_id, parentType === 'sire' ? 5 : 2, option);

    return () => {
      mounted = false;
    };
  }, [user_id, parentType, option,animal_id]);

  if (!open || !values) {
    return null;
  }

  const columns = [
    { name: "animal_id", label: "ID", options: { filter: false, sort: true, display: true } },
    { name: "tag_id", label: "TAG ID", options: { filter: false, sort: true, display: true } },
    { name: "animal_name", label: "NAME", options: { filter: false, sort: true, display: true } },
    { name: "dateofBirth", label: "DOB", options: { filter: false, sort: true, display: true } },
    { name: "main_breed", label: "BREED", options: { filter: true, sort: true, display: true } },
    { name: "breedComposition", label: "BREED COMPOSITION", options: { filter: true, sort: true, display: true } },
    { name: "sex", label: "SEX", options: { filter: true, sort: true, display: true } },
    { name: "animalType", label: "ANIMAL TYPE", options: { filter: true, sort: true, display: true } },
    { name: "countryofOriginName", label: "COUNTRY ORIGIN", options: { filter: true, sort: true, display: true } },
    { name: "main_breed_id", label: "Breed ID", options: { filter: false, sort: false, display: false } },
    { name: "breedComposition_id", label: "Breed Composition ID", options: { filter: false, sort: false, display: false } },
    { name: "countryofOrigin", label: "Country Of Origin ID", options: { filter: false, sort: false, display: false } }
  ];

  const options = {
    filter: true,
    download: false,
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
    },
    textLabels: {
      body: {
        noMatch: isLoading ? 'Loading...' : 'Sorry, there is no matching records to display',
      },
    },
    onRowClick: (rowData) => {
      setOutput({ status: null, message: '' });
      setData([]);
      setData(rowData);
    },
  };

  const handleChange = event => {
    event.persist();
    setData({
      ...data,
      [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSubmit = event => {
    event.preventDefault();
    let id = typeof data[0] === 'undefined' ? '' : data[0];
    parentType === 'sire' ? sessionStorage.setItem('_sire_id', id) : sessionStorage.setItem('_dam_id', id);
    sessionStorage.setItem('_sire_tag_id', data[1]);
    sessionStorage.setItem('_sire_breed', data[9]);
    sessionStorage.setItem('_sire_breed_composition', data[10]);
    sessionStorage.setItem('_sire_country_of_origin', data[11]);

    let _message = parentType === 'sire' ? 'Sire Selected Successfully' : 'Dam Selected Successfully';
    if (id === '') {
      setOutput({ status: 0, message: "Nothing Was Selected!" });
    } else {
      setOutput({ status: 1, message: _message });
    }
  }

  const onClear = () => {
    setData([]);
    parentType === 'sire' ? sessionStorage.setItem('_sire_id', '') : sessionStorage.setItem('_dam_id', '');
    let _message = parentType === 'sire' ? 'Sire Cleared Successfully' : 'Dam Cleared Successfully';
    setOutput({ status: 1, message: _message });
  };

  

  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <form onSubmit={handleSubmit} >
          <CardContent>

            {output.status === 0 ?
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

            <Grid container spacing={2} >

              {
                data.length > 0 ?
                  <>

                    <Grid
                      item
                      md={1}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="ID "
                        name='id'
                        variant="outlined"
                        value={data[0]}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="Tag ID"
                        variant="outlined"
                        value={data[1]}
                        name='tag_id'
                        onChange={handleChange}
                      />

                    </Grid>
                    <Grid
                      item
                      md={3}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="Name"
                        variant="outlined"
                        name='name'
                        value={data[2]}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="Breed"
                        variant="outlined"
                        name='breed'
                        value={data[4]}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="Breed Composition"
                        variant="outlined"
                        name='breed_composition'
                        value={data[5]}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      xs={12}
                    >
                      <TextField
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          readOnly: true
                        }}
                        margin='dense'
                        label="Country of origin"
                        variant="outlined"
                        name='country_of_origin'
                        value={data[8]}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>

                  : null
              }

              <Grid
                item
                md={12}
                xs={12}
              >
                {isLoading &&
                  <LinearProgress />
                }
              </Grid>
            </Grid>

            <PerfectScrollbar>
              <div className={classes.inner}>
                <MuiThemeProvider>
                  <MUIDataTable
                    title=""
                    data={values}
                    columns={columns}
                    options={options}
                  />
                </MuiThemeProvider>
              </div>
            </PerfectScrollbar>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button
              className={classes.saveButton}
              variant="contained"
              type="submit"
            >
              Confirm
            </Button>

            <Button
              className={classes.saveButton}
              onClick={onClear}
              variant="contained"
            >
              Clear
            </Button>

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

AnimalModal.displayName = 'AnimalModal';
AnimalModal.propTypes = {
  className: PropTypes.string,
  option: PropTypes.number.isRequired,
  animal_id: PropTypes.number.isRequired,  
  parentType: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

AnimalModal.defaultProps = {
  open: false,
  onClose: () => { }
};
export default AnimalModal;
