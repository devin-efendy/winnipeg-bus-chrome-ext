import React, { Component } from 'react';

import { Paper, Typography, Divider } from '@material-ui/core';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import SearchBar from './components/SearchBar';
// import { indigo, lightBlue } from '@material-ui/core/colors';

const styles = theme =>
  console.log(theme) || {
    root: {
      padding: theme.spacing.unit * 4,
      width: 400,
      height: 500
    },
    form: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-evenly',
      marginTop: theme.spacing.unit * 2
    },
    searchBar: {
      marginRight: theme.spacing.unit * 3
    }
  };

export default withStyles(styles)(
  class App extends Component {
    state = {
      exercises: [],
      searchBarInput: ''
    };

    handleSearchBarChange = ({ name, value }) => {
      this.setState({
        [name]: value
      });
    };

    handleSearchBarSubmit = e => {
      e.preventDefault();
      if (this.state.searchBarInput) {
        this.setState(({ exercises, searchBarInput }) => ({
          exercises: [
            ...exercises,
            {
              searchBarInput,
              id: Date.now()
            }
          ],
          searchBarInput: ''
        }));
      }
    };

    handleDelete = id =>
      this.setState(({ exercises }) => ({
        exercises: exercises.filter(ex => ex.id !== id)
      }));

    render() {
      const { searchBarInput, exercises } = this.state;
      const { classes } = this.props;

      return (
        <Paper className={classes.root}>
          <Typography variant="display1" align="center" gutterBottom>
            Winnipeg Bus Schedule
          </Typography>
          <SearchBar
            inputValue={searchBarInput}
            searchClass={classes.searchBar}
            formClass={classes.form}
            onChangeHandler={this.handleSearchBarChange}
            onSubmitHandler={this.handleSearchBarSubmit}
          />
          <List>
            {exercises.map(({ id, searchBarInput }) => (
              <ListItem key={id}>
                <ListItemText primary={searchBarInput} />
                <ListItemSecondaryAction>
                  <IconButton
                    color="primary"
                    onClick={() => this.handleDelete(id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      );
    }
  }
);
