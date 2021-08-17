import React,{useState} from 'react';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Typography, Divider } from '@material-ui/core';
import FilterDramaIcon from '@material-ui/icons/FilterDrama';
import { Page } from 'components';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import StorageIcon from '@material-ui/icons/Storage';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import { Originate,Pipeline } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 2)
  },
  card: {
    maxWidth: '50%',
    overflow: 'unset',
    display: 'flex',
    position: 'relative',
    '& > *': {
      flexGrow: 1,
      flexBasis: '50%',
      width: '50%'
    }
  },
  content: {
    padding: theme.spacing(8, 4, 3, 4)
  },
  icon: {
    backgroundColor: '#682622',
    color: theme.palette.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    position: 'absolute',
    top: -32,
    left: theme.spacing(3),
    height: 64,
    width: 64,
    fontSize: 32
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  right: {
    float: "right"
  }
}));


const WeatherDataExtractor = props => {
  const classes = useStyles();
  const [modalStatusOriginate, setModalStatusOriginate] = useState(false);
  const [modalStatusPipeline, setModalStatusPipeline] = useState(false);

  const handleCloseOriginate = () => {
    setModalStatusOriginate(false);
  };

  const handleOpenOriginate = () => {
    setModalStatusOriginate(true);
  };

  const handleClosePipeline = () => {
    setModalStatusPipeline(false);
  };

  const handleOpenPipeline = () => {
    setModalStatusPipeline(true);
  };


  return (
    <Page
      className={classes.root}
      title="Weather Data Extractor"
    >
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <FilterDramaIcon className={classes.icon} />
          <Typography
            gutterBottom
            variant="h4"
          >
            Weather Data Extractor
          </Typography>
          <Divider className={classes.divider} />
          <MenuList>
            <MenuItem onClick={handleOpenOriginate}>
              <ListItemIcon >
                <PlayCircleFilledIcon fontSize="small" />               
              </ListItemIcon>
              <Typography variant="inherit">Originate Request</Typography>
            </MenuItem>
            <MenuItem onClick={handleOpenPipeline}>
              <ListItemIcon>
                <DataUsageIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Check Pipeline</Typography>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                View Weather Data
              </Typography>
            </MenuItem>
          </MenuList>

          <Originate          
            onClose={handleCloseOriginate}
            open={modalStatusOriginate}         
          /> 
          <Pipeline          
            onClose={handleClosePipeline}
            open={modalStatusPipeline}         
          />  
        </CardContent>       
      </Card>

      
      
    </Page>
  );
};
export default WeatherDataExtractor;
