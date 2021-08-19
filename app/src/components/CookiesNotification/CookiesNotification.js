import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/styles';
import { Paper, Typography, Button } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 350,
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: theme.spacing(3),
    outline: 'none',
    zIndex: 2000
  },
  media: {
    padding: theme.spacing(1, 2),
    height: 180,
    textAlign: 'center',
    '& > img': {
      height: '100%',
      width: 'auto'
    }
  },
  content: {
    padding: theme.spacing(1, 2)
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1, 2, 2, 1)
  }
}));

const CookiesNotification = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('consent');

    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    Cookies.set('consent', 'true');
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <Paper
      className={classes.root}
      elevation={3}
    >
      <div className={classes.media}>
        <img
          alt="Cookies"
          src="/images/cookies-image.PNG"
        />
      </div>
      <div className={classes.content}>
        <Typography variant="body1">
          We use Cookies to ensure that we give you the best experience.      
        </Typography>
      </div>
      <div className={classes.actions}>
        <Button
          className={classes.agreeButton}    
          style={{backgroundColor: '#682622', color: '#FFFFFF'}}
          onClick={handleClose}
          variant="contained"
        >
          I Agree
        </Button>
      </div>
    </Paper>
  );
};

export default CookiesNotification;
