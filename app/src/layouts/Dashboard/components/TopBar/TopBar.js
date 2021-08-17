/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import authContext from '../../../../contexts/AuthContext';

import {
  AppBar,
  Badge,
  Button,
  IconButton,
  Toolbar,
  Hidden,
  Typography,
  Avatar,
  Input,
  colors,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener
} from '@material-ui/core';

import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import HelpIcon from '@material-ui/icons/Help';
import InputIcon from '@material-ui/icons/Input';
import MenuIcon from '@material-ui/icons/Menu';
import axios from 'utils/axios';
import useRouter from 'utils/useRouter';
import { NotificationsPopover } from 'components';


const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none'
  },
  flexGrow: {
    flexGrow: 1
  },
  search: {
    backgroundColor: 'rgba(104,38,34, 0.1)',
    borderRadius: 4,
    flexBasis: 300,
    height: 36,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    marginRight: theme.spacing(2),
    color: 'inherit'
  },
  searchInput: {
    flexGrow: 1,
    color: 'inherit',
    '& input::placeholder': {
      opacity: 1,
      color: 'inherit'
    }
  },
  searchPopper: {
    zIndex: theme.zIndex.appBar + 100
  },
  searchPopperContent: {
    marginTop: theme.spacing(1)
  },
  trialButton: {
    marginLeft: theme.spacing(2),
    color: theme.palette.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  trialIcon: {
    marginRight: theme.spacing(1)
  },
  notificationsButton: {
    marginLeft: theme.spacing(1)
  },
  notificationsBadge: {
    backgroundColor: colors.orange[600]
  },
  logoutButton: {
    marginLeft: theme.spacing(1)
  },
  logoutIcon: {
    marginRight: theme.spacing(1)
  },
  username: {
    color: 'inherit',
  },
  person: {
    display: 'flex'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  link: {
    color: theme.palette.white,
    "&:hover": {
        color: theme.palette.white,
        textDecoration: "underline #000000"
    }
},
}));

const TopBar = props => {
  const { onOpenNavBarMobile, className, ...rest } = props;
  const [{ isLoggedIn, username }, dispatch] = useContext(authContext);

  const classes = useStyles();
  const { history } = useRouter();
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = () => {
      axios.get('/api/account/notifications').then(response => {
        if (mounted) {
          setNotifications(response.data.notifications);
        }
      });
    };
    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    dispatch({
      type: 'LOGOUT'
    });
    history.push('/auth/login');
  };

  const handleNotificationsOpen = () => {
    setOpenNotifications(true);
  };

  const handleNotificationsClose = () => {
    setOpenNotifications(false);
  };



  return (

    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
      color="primary"
      style={{ background: '#682622' }}
    >

      <Toolbar>
        <div className={classes.person}>
          <RouterLink to="/">
            <Avatar
              alt="Person"
              className={classes.avatar}
              src="/images/adgg_avatar.png"
            />
          </RouterLink>
        </div>
        <div>
          <Typography
            color="inherit"
            variant="body1"
          >
            ADGG v1.0
          </Typography>
          <Typography
            color="inherit"
            variant="body2"
          >
            African Dairy Genetics Gain
          </Typography>
          <Typography
            color="inherit"
            variant="body2"
          >
            More Productive & Profitable Dairy Cows
          </Typography>
        </div>
        <div className={classes.flexGrow} />
        <Hidden mdDown>
          <Typography className={classes.username} variant="h5" >
            Hi {username} !
          </Typography>

          <IconButton
            className={classes.notificationsButton}
            color="inherit"
          >
            <RouterLink
              to="/user-guide/USER_MANUAL.chm"
              target="_blank" 
              download
              className={classes.link}             
            >
              <HelpIcon />
            </RouterLink>
          </IconButton>


          {
            /*
            <IconButton
              className={classes.notificationsButton}
              color="inherit"
              onClick={handleNotificationsOpen}
              ref={notificationsRef}
            >
              <Badge
                badgeContent={notifications.length}
                classes={{ badge: classes.notificationsBadge }}
                variant="dot"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            */

          }

          <Button
            className={classes.logoutButton}
            color="inherit"
            onClick={handleLogout}
          >
            <InputIcon className={classes.logoutIcon} />
            Sign out
          </Button>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onOpenNavBarMobile}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>

      <NotificationsPopover
        anchorEl={notificationsRef.current}
        notifications={notifications}
        onClose={handleNotificationsClose}
        open={openNotifications}
      />
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onOpenNavBarMobile: PropTypes.func
};

export default TopBar;
