import React, { Component } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    height: '484px'
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center'
  },
  busNumber: {
    padding: '1px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class BusList extends React.Component {
  renderBusses = schedule => {
    const scheduleList = schedule.map(item => {
      const hrSTR = item.arrivalEstimated.hour.toString();
      const hr = hrSTR.padStart(2, '0');
      const minSTR = item.arrivalEstimated.minute.toString();
      const min = minSTR.padStart(2, '0');
      return (
        <ListItem
          key={item.key}
          divider={true}
          style={{ position: 'relative', overflow: 'auto' }}
        >
          <Grid container>
            <Grid item xs={2} className={this.props.classes.gridItem}>
              <Paper
                color="inherit"
                square={true}
                elevation={1}
                className={this.props.classes.busNumber}
              >
                <Typography variant="subtitle1"> {item.number}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} className={this.props.classes.gridItem}>
              <Typography variant="subtitle1">{item.destination} </Typography>
            </Grid>
            <Grid
              item
              xs={1}
              className={this.props.classes.gridItem}
              style={{ justifyContent: 'center' }}
            >
              <Typography variant="subtitle1"> {`${hr}:${min}`}</Typography>
            </Grid>
          </Grid>
        </ListItem>
      );
    });

    return scheduleList;
  };

  render() {
    const { classes, schedule } = this.props;
    console.log(schedule);
    const stopSchedule = this.renderBusses(schedule);
    return (
      <div className={classes.root}>
        <List>{stopSchedule}</List>
      </div>
    );
  }
}

BusList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BusList);
