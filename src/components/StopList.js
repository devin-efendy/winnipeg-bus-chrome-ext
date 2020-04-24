import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { amber, blue, blueGrey } from '@material-ui/core/colors';
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@material-ui/core/';

const insertSpace = n => {
  let str = '';
  for (let i = 0; i < n; i++) {
    str += '\u00A0';
  }
  return str;
};

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    height: '100%'
  },
  paperBus: {
    marginRight: '10px',
    padding: '3px',
    width: '27px',
    height: '27px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const renderRoutesRow = (list, paperStyle) => {
  const renderResult = list.map(el => {
    let paperBGColor = blueGrey[700];
    let paperFontColor = 'white';
    if (el.coverage === 'rapid transit') {
      paperBGColor = blue[700];
    } else if (el.coverage === 'super express') {
      paperBGColor = amber[400];
      paperFontColor = 'black';
    } else if (el.coverage === 'express') {
      paperBGColor = amber[200];
      paperFontColor = 'black';
    }

    let busName = el.number.toString();
    if(busName === 'BLUE') {
      busName = 'B';
    }

    return (
      <Paper
        key={el.key}
        square={false}
        elevation={0}
        className={paperStyle}
        style={{
          background: `${paperBGColor}`,
          color: `${paperFontColor}`
        }}
      >
        <Typography color="inherit">{busName}</Typography>
      </Paper>
    );
  }); // routes map

  return renderResult;
};
class StopList extends React.Component {
  renderRoute = data => {
    let routes = [];
    let routesRow = [];

    if (data) {
      let numOfRoutes = data.routes.length;
      const rows = Math.ceil(numOfRoutes / 8);

      let startSlice = 0;
      let endSlice = numOfRoutes < 8 ? numOfRoutes : 8;

      for (let i = 0; i < rows; i++) {
        const slicedRoutes = data.routes.slice(startSlice, endSlice);

        routesRow = renderRoutesRow(slicedRoutes, this.props.classes.paperBus);

        routes.push(
          <div
            key={i}
            style={{
              display: 'flex',
              flexGrow: 1,
              marginTop: '10px'
            }}
          >
            {routesRow}
          </div>
        );

        startSlice += 8;
        endSlice = endSlice + 8 >= numOfRoutes ? numOfRoutes : (endSlice += 8);
      }
    } // If we have matching data

    return routes;
  };

  render() {
    // Variables props for stops and their routes
    const { classes, stops, stopRoutePair } = this.props;

    const RenderedItem = stops.map(item => {
      if (stopRoutePair) {
        let distance = '';
        if (item.distances.direct) {
          distance = Math.round(item.distances.direct).toString() + 'm away';
        } // Check if the bus stop is still in the radius of walking distance

        const data = stopRoutePair.find(pair => pair.key === item.key);
        const routes = this.renderRoute(data);

        return (
          <ListItem
            button
            key={item.key}
            divider={true}
            style={{ position: 'relative', overflow: 'auto' }}
            onClick={() => {
              this.props.onBusStopClick(item.key);
            }}
          >
            <div>
              <ListItemText
                primaryTypographyProps={{ variant: 'subheading' }}
                secondaryTypographyProps={{ variant: 'body1' }}
                primary={item.name}
                secondary={`#${item.number}${insertSpace(12)}${distance}`}
              />
              <div>{routes}</div>
            </div>
          </ListItem>
        );
      } // If all the routes for each stops are available
      // In other words, all APi call has finished
      else {
        return (
          <ListItem button key={item.key}>
            <ListItemText primary={item.name} />
          </ListItem>
        );
      }
    });

    return (
      <div className={classes.root}>
        <List>{RenderedItem}</List>
      </div>
    );
  }
}

StopList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StopList);
