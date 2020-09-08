import React, { Component } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  blueGrey,
  amber,
  blue,
  green,
  red,
  grey,
} from "@material-ui/core/colors";

// MUI theme Style
const styles = (theme) => ({
  root: {
    width: "100%",
    height: "486px",
  },
  busList: {
    position: "relative",
    overflow: "auto",
    height: "91%",
    padding: 0,
  },
  gridItem: {
    display: "flex",
    alignItems: "center",
  },
  busNumber: {
    padding: "3px",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}); // end of styles

/** BusList Component
 *  This class component will render a list of busses for the selected bus stop
 *  Additionally, it will also show the stop number and stop name of the selected stop
 *
 *  Each bus inside the list will contains 3 informations:
 *  1. Bus's number with color indicator
 *  2. Bus's destination
 *  3. Bus's arrival time and status with color indicator
 */
class BusList extends Component {
  renderTime = (item) => {
    let arrivalTime, scheduled, estimated, renderedTime;
    const currentTime = new Date();

    /** Variable Abbreviation
     * ch: current hour of user's time
     * cm: current minute of user's minute
     * eh: estimated hour of bus's arrival
     * em: estimated minute of bus's arrival
     */
    const ch = currentTime.getHours(); // current hour of user's time
    const cm = currentTime.getMinutes(); // current minute of user's minute
    const eh = item.arrivalEstimated.hour; // estimated hour of bus's arrival
    const em = item.arrivalEstimated.minute; // estimated minute of bus's arrival
    const hrSTR = eh.toString(); // string form of estimated hour of bus's arrival
    const minSTR = em.toString(); // string form of estimated minute of bus's arrival
    const hr = hrSTR.padStart(2, "0"); // string form of eh which padded with zero
    const min = minSTR.padStart(2, "0"); // string form of em which padded with zero
    const resultTime = `${hr}:${min}`; // formatted bus's arrival time in hh:mm

    // this will calculate the correct time to display
    // because 22:00 is earlier than 23:00 but 23:00 is earlier than 00:00 in the next day
    if (Math.abs(ch - 12) > Math.abs(eh - 12)) {
      scheduled = Math.abs(ch - 12) * 60 + Math.abs(cm - 60);
      estimated = Math.abs(eh - 12) * 60 + Math.abs(em - 60);
    } else {
      scheduled = Math.abs(ch - 12) * 60 + Math.abs(cm);
      estimated = Math.abs(eh - 12) * 60 + Math.abs(em);
    } //endif

    arrivalTime = Math.abs(estimated - scheduled);

    // this if statement check whether the arrival time is bigger than 30 minutes
    // or to handle current and estimated hours such as: 23:00 and 01:00 (next day)
    if (
      (Math.abs(ch - 12) === Math.abs(eh - 12) && ch !== eh) ||
      arrivalTime > 30
    ) {
      renderedTime = (
        <ListItemText
          primaryTypographyProps={{
            variant: "subheading",
            style: { display: "flex", justifyContent: "flex-end" },
          }}
          primary={resultTime}
        />
      );
    } else if (arrivalTime <= 30) {
      arrivalTime = arrivalTime.toString().padStart(2, "0") + " min";
      renderedTime = (
        <ListItemText
          primaryTypographyProps={{
            variant: "subheading",
            style: { display: "flex", justifyContent: "flex-end" },
          }}
          secondaryTypographyProps={{
            variant: "body1",
            style: { display: "flex", justifyContent: "flex-end" },
          }}
          primary={arrivalTime}
          secondary={resultTime}
        />
      );
    } // endif

    return renderedTime;
  };

  /** renderBusses
   * @summary This is to create a JSX that contains a list of busses in a particular stop
   *          Each item contains bus number, destination, and arrival time & status
   * @param {Array} schedule the bus schedule that need to be rendered
   */
  renderBusses = (schedule) => {
    const scheduleList = schedule.map((item) => {
      // Format arrival hour and minute e.g. pad with zeros
      let time = this.renderTime(item);

      // Choose the background and font color for each bus coverage
      let busNumBG = blueGrey[700];
      let busNumFontColor = "white";

      /**
       * this if statement is to determine what color of the bus depending of the coverage.
       * regular: blue grey
       * rapid transit: blue
       * super express: amber
       */
      if (item.coverage === "rapid transit") {
        busNumBG = blue[600];
      } else if (item.coverage === "super express") {
        busNumBG = amber[400];
        busNumFontColor = "black";
      } // endif

      /**
       * @summary this is to render the arrival status of the bus
       * @example:
       * if the bus is late it will be indicated with L and red background
       * on time: will be indicated with OK and blue background
       * early: will be indicated with E and green background
       */
      const renderStatus = () => {
        let renderedStatus = null;
        let statusColor = blue[500];
        let status = "OK";

        // determine the arrival status symbol
        if (item.arrivalStatus === "late") {
          status = "L";
          statusColor = red[500];
        } else if (item.arrivalStatus === "early") {
          status = "E";
          statusColor = green["A400"];
        } //endif

        renderedStatus = (
          <Paper
            elevation={0}
            className={this.props.classes.busNumber}
            style={{ backgroundColor: statusColor }}
          >
            <Typography variant="caption" style={{ color: "white" }}>
              {status}
            </Typography>
          </Paper>
        );
        return renderedStatus;
      }; // end of renderStatus

      // call the function
      const status = renderStatus();

      let busNumberRender = item.number.toString();
      if (busNumberRender === "BLUE") {
        busNumberRender = "B";
      }

      return (
        <ListItem
          button
          key={item.key}
          divider={true}
          style={{ position: "relative", overflow: "auto" }}
        >
          <Grid container>
            {/* Bus Number */}
            <Grid item xs={2} className={this.props.classes.gridItem}>
              <Paper
                square={false}
                elevation={0}
                className={this.props.classes.busNumber}
                style={{ background: busNumBG }}
              >
                <Typography variant="body1" style={{ color: busNumFontColor }}>
                  {busNumberRender}
                </Typography>
              </Paper>
            </Grid>
            {/* End of Bus Number Column */}
            {/* Bus Destination */}
            <Grid item xs={6} className={this.props.classes.gridItem}>
              <Typography variant="subtitle1">{item.destination} </Typography>
            </Grid>
            {/* End of Bus Destination Column */}
            {/* Bus arrival time and status */}
            <Grid
              item
              xs={4}
              className={this.props.classes.gridItem}
              style={{ justifyContent: "center" }}
            >
              {time}
              {status}
            </Grid>
            {/* End of Bus Arrival Time and Status Column */}
          </Grid>
        </ListItem>
      ); // return
    }); // end of schedule.map

    return scheduleList;
  }; // end of renderBusses

  render() {
    const { classes, schedule, busStop } = this.props;

    const stopSchedule = this.renderBusses(schedule);
    return (
      <div className={classes.root}>
        {/* This is the to part of the list that shows
            the bus stop's number and name */}
        <Paper
          square={true}
          style={{
            padding: "2%",
            backgroundColor: grey[800],
          }}
          elevation={0}
        >
          <Grid container>
            <Grid
              item
              xs={2}
              className={this.props.classes.gridItem}
              style={{ justifyContent: "center" }}
            >
              <Typography variant="body1" style={{ color: grey[300] }}>
                #{busStop.number}
              </Typography>
            </Grid>
            {/* End of Stop Number */}
            <Grid
              item
              xs={10}
              className={this.props.classes.gridItem}
              style={{ justifyContent: "center" }}
            >
              <Typography variant="body1" style={{ color: grey[300] }}>
                {busStop.name}
              </Typography>
            </Grid>
            {/* End of Stop Name */}
          </Grid>
          {/* End of Grid Container */}
        </Paper>
        {/* Render the list of busses */}
        <List className={classes.busList}>{stopSchedule}</List>
      </div>
    ); // end of return
  } // end of render
} // end of BusList class

BusList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BusList);
