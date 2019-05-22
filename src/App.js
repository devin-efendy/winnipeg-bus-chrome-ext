import React, { Component } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import SearchBar from './components/SearchBar';
import StopList from './components/StopList';

import TransitUtil from './util/TransitUtil';

const styles = theme => ({
  root: {
    width: 450,
    height: 550
    // border: '1px solid rgb(37,37,100)'
  },
  progress: {
    margin: theme.spacing.unit * 3
  },
  loadingPage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  }
});

export default withStyles(styles)(
  class App extends Component {
    state = {
      activeStop: [],
      activeStopSchedule: [],
      allStopsRoute: [],
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
      const { position, searchBarInput: input } = this.state;
      if (this.state.searchBarInput) {
        TransitUtil.getStops(position.coords, input).then(res => {
          this.setupStopsAndRoutes(res.data.stops);
        });
      }
    };

    handleBusStopClick = busStop => {
      this.setActiveStopSchedule(busStop);
    };

    componentDidMount() {
      this.setStopViaUserPosition();
    }

    setStopViaUserPosition = () => {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({ position }, () => {
            TransitUtil.getStops(position.coords).then(response => {
              this.setupStopsAndRoutes(response.data.stops);
            }); //getStopsFromPosition
          }); // Set State
        },
        err => {
          console.log(err.message);
        } // Geolocation error
      ); // Geolocation call
    }; // setStopViaUserPosition

    setupStopsAndRoutes = stopsList => {
      this.setState({ stopsList }, () =>
        this.state.stopsList.forEach(stop => {
          this.setStopRoute(stop.key);
        })
      );
    };

    setStopRoute = stop => {
      const updatePair = routes => {
        this.setState(({ allStopsRoute }) => ({
          allStopsRoute: [
            ...allStopsRoute,
            { key: stop, number: stop, routes: routes }
          ]
        }));
      };

      TransitUtil.getRoute(stop).then(response => {
        updatePair(response.data.routes);
      }); // getRoute
    }; // setStopRoute

    setActiveStopSchedule = async stop => {
      TransitUtil.getSchedule(stop).then(({ data }) => {
        const schedule = TransitUtil.parseSchedule(data);
        console.log(schedule);
      });
    };

    render() {
      const { searchBarInput } = this.state;
      const { classes } = this.props;

      const conditionalRender = () => {
        if (this.state.position && this.state.stopsList) {
          return (
            <StopList
              onBusStopClick={this.handleBusStopClick}
              stops={this.state.stopsList}
              stopRoutePair={this.state.allStopsRoute}
              getSchedule={this.getStopSchedule}
            />
          );
        } else {
          return (
            <div className={classes.loadingPage}>
              <CircularProgress size={60} className={classes.progress} />
              <Typography variant="headline">Looking for stops...</Typography>
            </div>
          );
        }
      };

      const RenderMain = conditionalRender();

      return (
        <Paper className={classes.root} square elevation={10}>
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
