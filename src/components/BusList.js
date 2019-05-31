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
  renderTime = item => {
    let arrivalTime, scheduled, estimated, renderedTime;
    const currentTime = new Date();

    /** Variable Abbreviation
     * ch: current hour of user's time
     * cm: current minute of user's minute
     * eh: estimated hour of bus's arrival
     * em: estimated minute of bus's arrival
     */
    const ch = currentTime.getHours();
    const cm = currentTime.getMinutes();
    const eh = item.arrivalEstimated.hour;
    const em = item.arrivalEstimated.minute;
    const hrSTR = eh.toString();
    const minSTR = em.toString();
    const hr = hrSTR.padStart(2, '0');
    const min = minSTR.padStart(2, '0');
    const resultTime = `${hr}:${min}`;

    if (Math.abs(ch - 12) > Math.abs(eh - 12)) {
      scheduled = Math.abs(ch - 12) * 60 + Math.abs(cm - 60);
      estimated = Math.abs(eh - 12) * 60 + Math.abs(em - 60);
    } else {
      scheduled = Math.abs(ch - 12) * 60 + Math.abs(cm);
      estimated = Math.abs(eh - 12) * 60 + Math.abs(em);
    }

    arrivalTime = Math.abs(estimated - scheduled);

    if (arrivalTime > 30) {
      renderedTime = (
        <ListItemText
          primaryTypographyProps={{
            variant: 'subheading',
            style: { display: 'flex', justifyContent: 'flex-end' }
          }}
          primary={resultTime}
        />
      );
    } else if (arrivalTime <= 30) {
      arrivalTime = arrivalTime.toString().padStart(2, '0') + ' min';
      renderedTime = (
        <ListItemText
          primaryTypographyProps={{
            variant: 'subheading',
            style: { display: 'flex', justifyContent: 'flex-end' }
          }}
          secondaryTypographyProps={{
            variant: 'body1',
            style: { display: 'flex', justifyContent: 'flex-end' }
          }}
          primary={arrivalTime}
          secondary={resultTime}
        />
      );
    }

    return renderedTime;
  };

  renderBusses = schedule => {
    const scheduleList = schedule.map(item => {
      // Format arrival hour and minute e.g. pad with zeros
      let time = this.renderTime(item);

      // Choose the background and font color for each bus coverage
      let busNumBG = blueGrey[700];
      let busNumFontColor = 'white';
      if (item.coverage === 'rapid transit') {
        busNumBG = blue[600];
      } else if (item.coverage === 'super express') {
        busNumBG = amber[400];
        busNumFontColor = 'black';
      }

      const renderStatus = () => {
        let renderedStatus = null;

        let status = 'OK';
        if (item.arrivalStatus === 'late') {
          status = 'L';
        } else if (item.arrivalStatus === 'early') {
          status = 'E';
        }

        return status;
      };

      return (
        <ListItem
          button
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
              {time}
              <Paper elevation={0} className={this.props.classes.busNumber}>
                {renderStatus()}
              </Paper>
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
