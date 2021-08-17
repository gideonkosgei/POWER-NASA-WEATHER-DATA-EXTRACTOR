import React, { Fragment, useEffect,useContext,useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Drawer, Divider, Paper, Avatar, Typography } from '@material-ui/core';
import { Hidden } from '@material-ui/core';
import useRouter from 'utils/useRouter';
import { Navigation } from 'components';
import navigationConfig from './navigationConfig';
import authContext from '../../../../contexts/AuthContext';
import {genericFunctionFourParameters,genericFunctionTwoParameters}   from '../../../../utils/API';
import {endpoint_get_avatar,endpoint_image_dir} from '../../../../configs/endpoints';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    overflowY: 'auto'
  },
  content: {
    padding: theme.spacing(2)
  },
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'fit-content'
  },
  avatar: {
    width: 100,
    height: 100
  },
  name: {
    marginTop: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(2)
  },
  navigation: {
    marginTop: theme.spacing(2)
  }
}));

const NavBar = props => {
  const { openMobile, onMobileClose, className, ...rest } = props;
  const classes = useStyles();
  const router = useRouter();
  const [ {name ,email,organization,user_id} ] = useContext(authContext);
  const [values, setValues] = useState({ });
  const [imageDir, setImageDir] = useState('');
  const type = 1;
  
  useEffect(() => {
    let mounted = true;
    let mounted_image_dir = true;

    if (openMobile) {
      onMobileClose && onMobileClose();
    }
  
    (async  (endpoint,desc,id,type) => {     
      await  genericFunctionFourParameters(endpoint,desc,id,type)
      .then(response => {                         
        if (mounted) { 
          if (response.payload[0].length !== 0 ) {   
            setValues(response.payload[0][0]);             
          }  
        }
      });
    })(endpoint_get_avatar,'get avatar',user_id,type); 

    
    (async  (endpoint,desc) => {     
      await  genericFunctionTwoParameters(endpoint,desc)
      .then(response => {                         
        if (mounted_image_dir) {  
            setImageDir(response.payload[0].image_dir);  
        }
      });
    })(endpoint_image_dir,'image ddir');

    return () => {
      mounted = false; 
      mounted_image_dir = false; 
    }; 
    
  }, [router.location.pathname,user_id,type,onMobileClose,openMobile]);


  const navbarContent = (
    <div className={classes.content}>
      <div className={classes.profile}>
        <Avatar
          alt="Person"
          className={classes.avatar}
          component={RouterLink}
          src={`${imageDir}/${values.filename}`}
          to="/settings"
        />
        <Typography
          className={classes.name}
          variant="h4"
        >
           {name}
        </Typography> 
        <Typography variant="body2">{organization}</Typography>
        <Typography variant="body2">{email}</Typography>
        
      </div>
      <Divider className={classes.divider} />
      <nav className={classes.navigation}>
        {navigationConfig.map(list => (
          <Navigation
            component="div"
            key={list.title}
            pages={list.pages}
            title={list.title}            
          />
        ))}
      </nav>
    </div>
  );

  return (
    <Fragment>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          <div
            {...rest}
            className={clsx(classes.root, className)}
          >
            {navbarContent}
          </div>
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Paper
          {...rest}
          className={clsx(classes.root, className)}
          elevation={1}
          square
        >
          {navbarContent}
        </Paper>
      </Hidden>
    </Fragment>
  );
};

NavBar.propTypes = {
  className: PropTypes.string,
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

export default NavBar;
