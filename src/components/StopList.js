import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { amber, indigo } from '@material-ui/core/colors';
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
    height: '484px'
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

class StopList extends React.Component {
  render() {
    const { classes, stops } = this.props;

    const RenderedItem = stops.map(item => {
      if (stops.size === this.props.stopRoutePair.size) {
        const walkDistance = Math.round(item.distances.walking);
        const stopRoute = this.props.stopRoutePair;
        const data = stopRoute.find(items => items.key === item.key);
        let routes = [];
        if (data) {
          routes = data.routes.map(el => {
            let paperBGColor = indigo[500];
            let paperFontColor = 'white';
            if (el.coverage === 'rapid transit') {
              paperBGColor = amber[500];
              paperFontColor = 'black';
            }

            return (
              <Paper
                key={el.key}
                square={true}
                elevation={0}
                className={classes.paperBus}
                style={{
                  background: `${paperBGColor}`,
                  color: `${paperFontColor}`
                }}
              >
                <Typography color="inherit">{el.number.toString()}</Typography>
              </Paper>
            );
          });
        }

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
                secondary={`#${item.number}${insertSpace(
                  12
                )}${walkDistance} m away`}
              />
              <div
                style={{
                  display: 'flex',
                  flexGrow: 1,
                  marginTop: '10px'
                }}
              >
                {routes}
              </div>
            </div>
          </ListItem>
        );
      } else {
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
