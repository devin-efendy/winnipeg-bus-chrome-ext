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

// TODO: Create a flag that indicates a list has been rendered

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

        this.setState({ stopsList, allStopsRoute });
      });
    };

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
        // return <BusList busRoutes={this.state}/>;
        if (
          this.state.position &&
          this.state.stopsList &&
          this.state.allStopsRoute
        ) {
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
