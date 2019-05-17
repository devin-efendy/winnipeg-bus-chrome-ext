import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Refresh from '@material-ui/icons/Refresh';
import Send from '@material-ui/icons/Send';
import MyLocation from '@material-ui/icons/MyLocation';

const styles = theme => ({
  root: {
    width: '100%'
    // height: '100%'
  },
  grow: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'space-evenly'
  },
  searchIcon: {
    width: theme.spacing.unit * 6,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textFieldInput: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    color: 'white',
    width: '200px',
    padding: '9px 14px'
  }
});

class PrimarySearchAppBar extends React.Component {
  state = {
    anchorEl: null,
    mobileMoreAnchorEl: null
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar style={{ padding: 0 }}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <div
              style={{
                paddingLeft: 50
                // height: '70%'
              }}
            >
              <TextField
                onChange={({ target: { name, value } }) => {
                  this.props.onChangeHandler({ name, value });
                }}
                value={this.props.inputValue}
                name="searchBarInput"
                color="inherit"
                variant="outlined"
                placeholder="Search..."
                className={classes.textField}
                inputProps={{ className: classes.textFieldInput }}
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
              <IconButton color="inherit">
                <MyLocation />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

PrimarySearchAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PrimarySearchAppBar);
