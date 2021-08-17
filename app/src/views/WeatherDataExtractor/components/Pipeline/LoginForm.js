/* eslint-disable no-unused-vars */
import React, { useState, useContext, Fragment ,useEffect} from 'react';
import validate from 'validate.js';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField,InputAdornment,IconButton,CircularProgress,Checkbox,Typography} from '@material-ui/core';
import Spinner from '../../../../components/Spinner/Spinner';
import authContext from '../../../../contexts/AuthContext';
import useRouter from 'utils/useRouter';
import { Redirect } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import {Visibility,VisibilityOff,AccountCircle} from '@material-ui/icons';
import {endpoint_user_authentication} from '../../../../configs/endpoints';
import {authenticate}   from '../../../../utils/API';


const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' }
  }
};

const useStyles = makeStyles(theme => ({
  root: {},
  fields: {
    margin: theme.spacing(-1),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1)
    }
  },
  submitButton: {
    marginTop: theme.spacing(2),
    width: '100%',
    backgroundColor: '#682622',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center'
  },
  rememberMeCheckbox: {
    marginLeft: '-14px'
  }
}));


const LoginForm = props => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const router = useRouter();
  const [load, setLoad] = useState(false);

  const [formState, setformState] = useState({
    isValid: false,
    values: {},
    touched: {},    
    errors: {},
    showPassword: false ,
    loading:false  
  }); 

  const [ { isLoggedIn,isLoading, error }, dispatch ] = useContext(authContext);  

  useEffect(() => {
    const errors = validate(formState.values, schema);
    setformState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}             
    }));
  }, [formState.values]);

  const handleChange = event => {
    event.persist();
    setformState(formState => ({
      ...formState,
      values: {
        ...formState.values,
      [event.target.name]: event.target.type === 'checkbox'? event.target.checked : event.target.value
    },
    touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleClickShowPassword = () => {
    setformState({ ...formState, showPassword: !formState.showPassword });
  };  

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  
  const handleSubmit =  event => {  
    event.preventDefault();    
    const username = formState.values.email;
    const password = formState.values.password;

    authenticate(endpoint_user_authentication,username,password)  
      .then((userData) => {
       let is_active = true; 
       let is_admin = false; 
       if (userData.payload[0].length ===1){
        is_active = userData.payload[0][0].status === 1? true : false;
        const role_id = parseInt(userData.payload[0][0].role_id);
        is_admin = (role_id === 7 || role_id === 9 || role_id === 10 || role_id === 14) ? 1 : 0;       
        sessionStorage.setItem("is_admin1", is_admin);
        
       }
        if(userData.auth_status && is_active ){                
            dispatch({
              type: 'LOGIN',
              payload: {
                userData
              }
            });
        } else {         
            dispatch({
              type: 'LOGIN_ERROR',
              payload: {
                error: !is_active ? 'This account is not active. Contact your local administrator' : userData.user_exist ? "Login failed. Password is incorrect!" : " This account is not registered!"
              }
            });
          }
       } 
      )
			.catch((error) => {        
				dispatch({
					type: 'LOGIN_ERROR',
					payload: {
						error: error.message
					}
				});
			})
			.finally(() => {			
			});
    router.history.push('/');
  };

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;    

 
  return (
    <Fragment>       
			{isLoggedIn ? (
				<Redirect to="/overview" />       
			) : (
    <Fragment>        
      	{error && <Alert severity="error" >{error}</Alert>}
    <form
      {...rest}
      className={clsx(classes.root, className)}
      onSubmit={handleSubmit}
    >
      <div className={classes.fields}>
        <TextField
          error={hasError('email')}
          fullWidth
          helperText={hasError('email') ? formState.errors.email[0] : null}
          label="Email address"
          name="email"
          onChange={handleChange}
          value={formState.values.email || ''}
          variant="outlined"

          InputProps={{
            endAdornment: (
              <InputAdornment position="end"  >
                <IconButton  
                  edge="end"
                  variant="outlined"
                  color="inherit"
                >
                     <AccountCircle /> 
                </IconButton>
              </InputAdornment>
            ),
          }}

        />
        <TextField
          error={hasError('password')}
          fullWidth
          helperText={
            hasError('password') ? formState.errors.password[0] : null
          }
          label="Password"
          name="password"
          onChange={handleChange}
          type={formState.showPassword ? 'text' : 'password'}
          value={formState.values.password || ''}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end"  >
                <IconButton              
                  aria-label="Toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  variant="outlined"
                  color="inherit"
                >
                    {formState.showPassword ? <Visibility/> : <VisibilityOff />}  
                </IconButton>
              </InputAdornment>
            ),
          }}
          
        />
      </div>
      <div>
          <div className={classes.rememberMe}>
            <Checkbox
              checked={formState.values.rememberMe || false}
              className={classes.rememberMeCheckbox}
              color="primary"
              name="rememberMe"
              onChange={handleChange}
            />
            <Typography
              color="textSecondary"
              variant="body1"
            >
              Remember me              
            </Typography>
          </div>          
        </div>
      
      <Button
        className={classes.submitButton}
        color="secondary"        
        disabled={!formState.isValid}
        size="large"
        type="submit"
        variant="contained"              
      >    
          {load ? (
                "Loading..."
              ) : (
                "Login"
              )} 
      </Button>
    </form>
    </Fragment>
    )}
		</Fragment>
  );
};

LoginForm.propTypes = {
  className: PropTypes.string
};

export default LoginForm;