import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import InputBase from '@material-ui/core/InputBase';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Refresh from '@material-ui/icons/Refresh';
import Send from '@material-ui/icons/Send';
import MyLocation from '@material-ui/icons/MyLocation';
import ArrowBackIosSharp from '@material-ui/icons/ArrowBackIosSharp';
import { blue } from '@material-ui/core/colors';

const styles = theme => ({
  grow: {
    flexGrow: 1
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 1,
      width: 'auto'
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 5,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing.unit * 1,
    paddingLeft: theme.spacing.unit * 5,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 100
    }
  }
});

class SearchBar extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.grow}>
        <AppBar position="static">
          <Toolbar style={{ padding: '0 2px', backgroundColor: blue[500] }}>
            <IconButton color="inherit">
              <ArrowBackIosSharp />
            </IconButton>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                onChange={({ target: { name, value } }) => {
                  this.props.onChangeHandler({ name, value });
                }}
                name="searchBarInput"
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>

            <div className={classes.grow}>
              <IconButton
                onClick={e => {
                  this.props.onSubmitHandler(e);
                }}
                color="inherit"
              >
                <Send />
              </IconButton>
              <IconButton color="inherit">
                <Refresh />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={e => {
                  this.props.onUseLocationHandler(e);
                }}
              >
                <MyLocation />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

SearchBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchBar);
