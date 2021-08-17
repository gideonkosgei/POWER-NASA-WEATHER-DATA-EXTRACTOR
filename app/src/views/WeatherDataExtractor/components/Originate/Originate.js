import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ExcelRenderer } from 'react-excel-renderer';
import { makeStyles } from '@material-ui/styles';
import { Grid, Button, Input, Fab, CircularProgress, Modal, Card, CardContent, CardActions } from '@material-ui/core';
import { upload } from '../../../../utils/API';
import { endpoint_upload } from '../../../../configs/endpoints';
import uuid from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: '35%',
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

const Originate = props => {
  const { open, onClose, className, ...rest } = props;
  const classes = useStyles();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [rows, setRows] = useState(null);
  const [cols, setCols] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [output, setOutput] = useState({ status: null, message: "" });
  const _uuid = uuid();

  const timer = React.useRef();
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  const fileInput = React.createRef();
  const renderFile = (fileObj) => {
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err.message);
      }
      else {
        const column_count = resp.rows[0].length;

        for (let i = 0; i < resp.rows.length; i++) {
          for (let r = 0; r < resp.rows[i].length; r++) {
            /* Replace whitespaces with underscore on column headers */
            if (i === 0) {
              resp.rows[i][r] = resp.rows[i][r].split(" ").join("_").toUpperCase();
            }
            /* replace empty slots with null */
            if (typeof resp.rows[i][r] === 'undefined' || resp.rows[i][r] === '') {
              resp.rows[i][r] = null;
            }

          }


          /** this section is very important. It sorts the limitations of the excel renderer
           * the array excludes empty cells after the last cell with a value
           * The code below handles this
           */

          let diff = column_count - resp.rows[i].length;
          for (let x = 0; x < diff; x++) {
            resp.rows[i].push(null);
          }

        }

        /* remove the 1st row. it contains the column headers */
        let file_rows = [];
        for (let i = 0; i < resp.rows.length; i++) {
          if (i !== 0) {
            file_rows.push(resp.rows[i]);
          }
        }
        setCols(resp.rows[0]);
        setRows(file_rows);
        setDataLoaded(true);
      }
    });
  };

  const fileHandler = (event) => {
    if (event.target.files.length) {
      let fileObj = event.target.files[0];
      let fileName = fileObj.name;


      if (fileName.slice(fileName.lastIndexOf('.') + 1) === "csv" || fileName.slice(fileName.lastIndexOf('.') + 1) === "xls" || fileName.slice(fileName.lastIndexOf('.') + 1) === "xlsx") {
        setIsFormInvalid(false);
        setUploadedFileName(fileName);
        renderFile(fileObj)
      }
      else {
        setIsFormInvalid(true);
        setUploadedFileName("");
      }
    }
  };
  const openFileBrowser = () => {
    fileInput.current.click();
  }

  const handleSubmit = event => {
    sessionStorage.setItem("uuid", _uuid);
    event.preventDefault();
    if (!loading) {
      setSuccess(false);
      setLoading(true);
    }
    (async (endpoint, rows, cols, uuid) => {
      await upload(endpoint, rows, cols, uuid)
        .then((response) => {
          setOutput({ status: null, message: '' });
          timer.current = window.setTimeout(() => {
            setSuccess(true);
            setLoading(false);
            if (parseInt(response.status) === 1) {
              setOutput({ status: parseInt(response.status), message: response.message });
            } else {
              setOutput({ status: parseInt(response.status), message: response.message })
            }

          }, 500);

        }).catch((error) => {
          setOutput({ status: 0, message: error.message })
          setSuccess(false);
          setLoading(false);
        });
    })(endpoint_upload, rows, cols, _uuid);
  };

y  const options = {
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

  /** set datatable columns */
  let columns = [];
  if (cols) {
    for (let i = 0; i < cols.length; i++) {
      columns.push(
        {
          name: cols[i],
          label: cols[i],
          options: {
            filter: false,
            sort: true,
            display: true
          }
        }
      );
    }
  }


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
                  >
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <br />

                      <Button color="info" onClick={openFileBrowser}><i className="cui-file"></i> Browse</Button>
                      <input type="file" hidden onChange={fileHandler} ref={fileInput} onClick={(event) => { event.target.value = null }} />
                      <Input type="text" value={uploadedFileName} readOnly invalid={isFormInvalid} />

                    </Grid>

                    <Grid container >
                      <Grid item md={12} xs={12} >
                        {dataLoaded &&
                          <div>
                            <PerfectScrollbar>
                              <MuiThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable
                                  title=""
                                  data={rows}
                                  columns={columns}
                                  options={options}
                                />
                              </MuiThemeProvider>
                            </PerfectScrollbar>
                          </div>
                        }
                      </Grid>
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
                              upload
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
Originate.displayName = 'Originate';

Originate.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

Originate.defaultProps = {
  open: false,
  onClose: () => { }
};

export default Originate;
