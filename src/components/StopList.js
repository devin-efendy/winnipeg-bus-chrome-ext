import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText } from '@material-ui/core/';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    height: '484px'
  }
});

class StopList extends React.Component {
  formatStopName = name => {
    const quadrant = `${name.charAt(0)}B`;
    let detail = name.substr(name.indexOf(' '), name.length);
    detail = detail.replace('at', '@');
    let nameResult = `${quadrant} ${detail}`;
    return nameResult;
  };

  render() {
    const { classes, stops } = this.props;

    const RenderedItem = stops.map(item => {
      if (stops.size === this.props.stopRoutePair.size) {
        const name = this.formatStopName(item.name);
        const walkDistance = item.distances.walking;
        const stopRoute = this.props.stopRoutePair;
        const data = stopRoute.find(items => items.key === item.key);
        let routes = '';
        if (data) {
          data.routes.forEach(el => {
            routes += el.number.toString() + ' ';
          });
          console.log(routes);
        }

        return (
          <ListItem button key={item.key}>
            <ListItemText primary={name} secondary={routes} />
            <ListItemText secondary={`${walkDistance}m away`} />
          </ListItem>
        );
      } else {
        return (
          <ListItem button key={item.key}>
            <ListItemText primary={this.formatStopName(item.name)} />
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
