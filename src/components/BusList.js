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
import { blueGrey, amber, blue } from '@material-ui/core/colors';

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
    // marginRight: '10px'
  },
  busNumber: {
    padding: '3px',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class BusList extends React.Component {
  calcArrival = time => {
    let arrivalTime = -1;

    const sh = time.arrivalScheduled.hour;
    const sm = time.arrivalScheduled.minute;
    const eh = time.arrivalEstimated.hour;
    const em = time.arrivalEstimated.minute;

    // TODO: Calculate the time the user have to wait for the bus
    let scheduled, estimated;

    if (Math.abs(sh - 23) > Math.abs(eh - 12)) {
      scheduled = Math.abs(sh - 12) * 60 - Math.abs(sm - 60);
      estimated = Math.abs(eh - 12) * 60 - Math.abs(em - 60);
    } else {
      scheduled = Math.abs(sh - 12) * 60 - Math.abs(sm - 60);
      estimated = Math.abs(eh - 12) * 60 - Math.abs(em - 60);
    }

    arrivalTime = Math.abs(estimated - scheduled);

    return arrivalTime;
  };

  renderBusses = schedule => {
    const scheduleList = schedule.map(item => {
      // Format arrival hour and minute e.g. pad with zeros
      const hrSTR = item.arrivalEstimated.hour.toString();
      const hr = hrSTR.padStart(2, '0');
      const minSTR = item.arrivalEstimated.minute.toString();
      const min = minSTR.padStart(2, '0');
      // Choose the background and font color for each bus coverage
      let busNumBG = blueGrey[700];
      let busNumFontColor = 'white';
      if (item.coverage === 'rapid transit') {
        busNumBG = blue[600];
      } else if (item.coverage === 'super express') {
        busNumBG = amber[400];
        busNumFontColor = 'black';
      }

      return (
        <ListItem
          key={item.key}
          divider={true}
          style={{ position: 'relative', overflow: 'auto' }}
        >
          <Grid container>
            <Grid item xs={2} className={this.props.classes.gridItem}>
              <Paper
                square={false}
                elevation={0}
                className={this.props.classes.busNumber}
                style={{ background: busNumBG }}
              >
                <Typography
                  variant="subtitle1"
                  style={{ color: busNumFontColor }}
                >
                  {' '}
                  {item.number}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} className={this.props.classes.gridItem}>
              <Typography variant="subtitle1">{item.destination} </Typography>
            </Grid>
            <Grid
              item
              xs={4}
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
