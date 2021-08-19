import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Snackbar, SnackbarContent, colors } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

const useStyles = makeStyles(theme => ({
  content: {
    backgroundColor: colors.red[300]    
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: theme.spacing(2)
  }
}));

const ErrorSnackbar = props => {
  const { open, onClose } = props;

  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={6000}
      onClose={onClose}
      open={open}
    >
      <SnackbarContent
        className={classes.content}
        message={
          <span className={classes.message}>
            <ErrorOutlineIcon className={classes.icon} />
            Error occured during processing!
          </span>
        }
        variant="h6"
      />
    </Snackbar>
  );
};

ErrorSnackbar.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

ErrorSnackbar.defaultProps = {
  open: true,
  onClose: () => {}
};

export default ErrorSnackbar;
