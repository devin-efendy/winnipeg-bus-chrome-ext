import React, { Component } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import SearchBar from './components/SearchBar';
import StopList from './components/StopList';
import BusList from './components/BusList';

import TransitUtil from './util/TransitUtil';

const styles = theme => ({
  root: {
    width: 450,
    height: 550
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

// TODO: Create a flag that indicates a list has been rendered

export default withStyles(styles)(
  class App extends Component {
    state = {
      activeStop: [],
      activeStopSchedule: [],
      allStopsRoute: [],
      nearbyStops: [],
      nearbyStopsRoute: [],
      position: null,
      searchBarInput: '',
      onStopListPage: false,
      onBusListPage: false
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
          this.setState({ onStopListPage: false, onBusListPage: false }, () => {
            this.setupStopsAndRoutes(res.data.stops);
          }); // setState
        }); // TransitUtil.getStops
      } // If the user input is not empty
    };

    handleBusStopClick = busStop => {
      this.setState({ onStopListPage: false }, () => {
        this.setActiveStopSchedule(busStop);
      });
    };

    handleRefreshClick = () => {};

    handleUseLocation = e => {
      e.preventDefault();
      if (this.state.nearbyStops.length > 0) {
        this.setState({
          onStopListPage: true,
          onBusListPage: false,
          activeStop: this.state.nearbyStops,
          allStopsRoute: this.state.nearbyStopsRoute
        });
      }
    };

    componentDidMount() {
      this.setStopViaUserPosition();
    }

    setStopViaUserPosition = () => {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({ position }, () => {
            const testData = { latitude: 49.81231, longitude: -97.1563673 };
            // original data is position.coords
            TransitUtil.getStops(testData).then(response => {
              this.setupStopsAndRoutes(response.data.stops, true);
            }); //getStopsFromPosition
          }); // Set State
        },
        err => {
          console.log(err.message);
        } // Geolocation error
      ); // Geolocation call
    }; // setStopViaUserPosition

    setupStopsAndRoutes = (stopsList, useLocation = false) => {
      let allStopsRoute = [];

      const runPromises = () => {
        let result = Promise.resolve(TransitUtil.getRoute(stopsList[0].key));

        for (let i = 1; i < stopsList.length; i++) {
          result = result.then(res => {
            allStopsRoute.push({
              key: stopsList[i - 1].key,
              routes: res.data.routes
            });
            return TransitUtil.getRoute(stopsList[i].key);
          });
        }

        return result;
      };

      runPromises().then(res => {
        const lastKey = stopsList[stopsList.length - 1].key;
        allStopsRoute.push({ key: lastKey, routes: res.data.routes });

        if (useLocation) {
          this.setState({
            nearbyStops: stopsList,
            nearbyStopsRoute: allStopsRoute,
            activeStop: stopsList,
            allStopsRoute,
            onStopListPage: true,
            onBusListPage: false
          });
        } else {
          this.setState({
            activeStop: stopsList,
            allStopsRoute,
            onStopListPage: true,
            onBusListPage: false
          });
        }
      });
    };

    setActiveStopSchedule = stop => {
      TransitUtil.getSchedule(stop).then(({ data }) => {
        const schedule = TransitUtil.parseSchedule(data);
        this.setState({ onBusListPage: true, activeStopSchedule: schedule });
      });
    };

    render() {
      const { searchBarInput } = this.state;
      const { classes } = this.props;

      const conditionalRender = () => {
        if (this.state.onStopListPage && !this.state.onBusListPage) {
          return (
            <StopList
              onBusStopClick={this.handleBusStopClick}
              stops={this.state.activeStop}
              stopRoutePair={this.state.allStopsRoute}
              getSchedule={this.getStopSchedule}
            />
          );
        } else if (this.state.onBusListPage && !this.state.onStopListPage) {
          return <BusList schedule={this.state.activeStopSchedule} />;
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
            onUseLocationHandler={this.handleUseLocation}
            onSubmitHandler={this.handleSearchBarSubmit}
          />

          <div style={{ width: '100%', height: '486px' }}>{RenderMain}</div>
        </Paper>
      );
    }
  }
);
