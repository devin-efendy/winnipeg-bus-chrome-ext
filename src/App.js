import React, { Component } from 'react';

import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import SearchBar from './components/SearchBar';
import StopList from './components/StopList';
import openData from './api/openData';
import CircularProgress from '@material-ui/core/CircularProgress';

// import { indigo, lightBlue } from '@material-ui/core/colors';

const styles = theme => ({
  root: {
    // padding: theme.spacing.unit * 4,
    width: 450,
    height: 550
  },
  progress: {
    margin: theme.spacing.unit * 3
  }
});

export default withStyles(styles)(
  class App extends Component {
    state = {
      stopsRoute: [],
      stopsList: [],
      position: null,
      searchBarInput: ''
    };

    handleSearchBarChange = ({ name, value }) => {
      this.setState({
        [name]: value
      });
    };

    handleSearchBarSubmit = async e => {
      e.preventDefault();
    };

    componentDidMount() {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({ position }, async () => {
            const lat = this.state.position.coords.latitude;
            const lon = this.state.position.coords.longitude;
            await openData
              .get(
                '/stops.json?distance=1000&lat=' +
                  lat +
                  '&lon=' +
                  lon +
                  '&walking=true&max-results=10&api-key=FO8ZSABX3wyHFEo062j'
              )
              .then(res => {
                this.setupStopsAndRoutes(res.data.stops);
              })
              .catch(err => {
                console.log(err.message);
                this.setState({ stopsList: [] });
              });
          });
        },
        err => {
          console.log(err.message);
        }
      );
    }

    setupStopsAndRoutes = stopsList => {
      this.setState({ stopsList }, () =>
        this.state.stopsList.forEach(stop => {
          this.setStopSchedule(stop.key);
        })
      );
    };

    setStopSchedule = async stop => {
      await openData
        .get(`/routes.json?stop=${stop}?&api-key=FO8ZSABX3wyHFEo062j`)
        .then(res => {
          this.setState(({ stopsRoute }) => ({
            stopsRoute: [
              ...stopsRoute,
              { key: stop, number: stop, routes: res.data.routes }
            ]
          }));
        })
        .catch(err => {
          console.log(err.message);
          return [];
        });
    };

    render() {
      const { searchBarInput } = this.state;
      const { classes } = this.props;

      const conditionalRender = () => {
        if (this.state.position && this.state.stopsList) {
          return (
            <StopList
              stops={this.state.stopsList}
              stopRoutePair={this.state.stopsRoute}
              getSchedule={this.getStopSchedule}
            />
          );
        } else {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <CircularProgress size={60} className={classes.progress} />
              <Typography variant="display1">Looking for stops...</Typography>
            </div>
          );
        }
      };

      const RenderMain = conditionalRender();

      return (
        <Paper className={classes.root}>
          <SearchBar
            inputValue={searchBarInput}
            onChangeHandler={this.handleSearchBarChange}
            onSubmitHandler={this.handleSearchBarSubmit}
          />

          <div style={{ width: '100%', height: '486px' }}>{RenderMain}</div>
        </Paper>
      );
    }
  }
);
