import React, { Component } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({});

class BusList extends React.Component {
  render() {
    return (
      <div>
        <h1>Bus List</h1>
      </div>
    );
  }
}

BusList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BusList);
