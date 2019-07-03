/** SearchBar.js
 *  This class component is used to render the search bar at the top of the extension
 *  The purpose of this element is to let the user navigate through the App
 *  This component includes:
 *  1. Back Arrow Icon
 *     To navigate to previous page
 *  2. Input Bar
 *     To let the user search for a stop or location
 *  3. Send Icon
 *     To submit user input and make the API call using it
 *  4. Refresh Icon
 *     To refresh the schedule page
 *  5. MyLocation Icon
 *     To let the user to use their location to look for bus stops
 */
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

// Styles that required to properly render the Element
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
    width: 'auto%'
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
    width: '100%'
  }
});

class SearchBar extends React.Component {
  render() {
    const { classes } = this.props;

    /**
     * @summary this is to render the appropriate type of
     *          Back Arrow icon according to the page
     */
    const renderBackArrow = () => {
      if (this.props.onSchedulePage) {
        return (
          // Return a Back Arrow
          <IconButton
            color="inherit"
            onClick={e => {
              this.props.onBackHandler(e);
            }}
          >
            <ArrowBackIosSharp />
          </IconButton>
        );
      } // if the user is on the schedule page
      else {
        // Return a disabled Back Arrow
        return (
          <IconButton
            color="inherit"
            onClick={e => {
              this.props.onBackHandler(e);
            }}
            disabled
          >
            <ArrowBackIosSharp />
          </IconButton>
        );
      } // if the user is in the bus stop page or loading page
    }; // end of renderBackArrow

    return (
      <div className={classes.grow}>
        <AppBar position="static">
          <Toolbar style={{ padding: '0 2px', backgroundColor: blue[500] }}>
            {/* This is to make Back Arrow appear at the very left */}
            {renderBackArrow()}
            {/* Render Search Input:
                This will render an Input Icon and an Input Box*/}
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                onChange={({ target: { name, value } }) => {
                  this.props.onChangeHandler({ name, value });
                }}
                value={this.props.inputValue}
                name="searchBarInput"
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>
            {/* End of Search Input */}
            {/* This section will render the three Icon on the top right:
                Send, Refresh, and MyLocation Icons */}
            <div className={classes.grow}>
              <IconButton
                onClick={e => {
                  this.props.onSubmitHandler(e);
                }}
                color="inherit"
              >
                <Send />
              </IconButton>
              {/* end of Send icon */}
              <IconButton
                color="inherit"
                onClick={e => {
                  this.props.onRefresh(e);
                }}
              >
                <Refresh />
              </IconButton>
              {/* end of Refresh icon */}
              <IconButton
                color="inherit"
                onClick={e => {
                  this.props.onUseLocationHandler(e);
                }}
              >
                <MyLocation />
              </IconButton>
              {/* end of Location icon */}
            </div>
            {/* end of Icon group: Send, Refresh, Location */}
          </Toolbar>
        </AppBar>
      </div>
    ); // end - return
  }
}

SearchBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchBar);
