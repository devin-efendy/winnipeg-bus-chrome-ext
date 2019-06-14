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

export default withStyles(styles)(
  class App extends Component {
    state = {
      activeStop: [],
      activeStopSchedule: [],
      allStopsRoute: [],
      nearbyStops: [],
      nearbyStopsRoute: [],
      selectedBusStop: { name: '', number: -1 },
      position: null,
      searchBarInput: '',
      onStopListPage: false,
      onBusListPage: false
    };

    /** handleSearchBarChange
     * @summary handle changes on user input in search bar
     * @param {String} name name of component that changed (searchBarInput)
     * @param {String} value current value of the search bar
     */
    handleSearchBarChange = ({ name, value }) => {
      this.setState({
        [name]: value
      }); // setState
    }; // end - handleSearchBarChange

    /** handleSearchBarSubmit
     * @async
     * @summary to handle the event when the user submit a search input.
     *          this will setup a new route for the searches that user submit
     * @param {Event} e event when the submit button clicked
     */
    handleSearchBarSubmit = async e => {
      e.preventDefault();
      const {
        position,
        searchBarInput: input,
        onBusListPage,
        onStopListPage
      } = this.state; // destructure

      if (this.state.searchBarInput && (onBusListPage || onStopListPage)) {
        this.setState(
          {
            onStopListPage: false,
            onBusListPage: false,
            selectedBusStop: { name: '', number: -1 },
            searchBarInput: ''
          }, // states to be updated
          () => {
            if (position) {
              console.log('test');
              TransitUtil.getStops(position.coords, input)
                .then(res => {
                  this.setupStopsAndRoutes(res.data.stops);
                }) // successful promises
                .catch(err => {
                  console.log(err);
                }); // handle error
            } // if - position
          } // callback function
        ); // setState
      } // endif the user input is not empty
    }; // end - handleSearchBarSubmit

    /** handleBusStopClick
     * @summary to handle the bus stop that was clicked by the user
     *          this function will do an API call to look for the schedule of the
     *          bus stop that was clicked/picked by the user
     * @param {Number} busStop the number of the bus stop that the user picked
     *                         then we look for the schedule for the stop with that number
     */
    handleBusStopClick = busStop => {
      // the setState is used to make the app render the loading page while
      // we do the API call for the bus stop
      this.setState({ onStopListPage: false }, () => {
        this.setActiveStopSchedule(busStop);
      }); // setState
    };

    /** handleRefreshClick
     * @summary to handle the event where the user clicked the refresh button
     *          this will check whether the user is in the appropriate page and
     *          also has already selected a bus stop.
     *          If the condition is appropriate to be refreshed then this function
     *          will make an API call to look for the updated/new schedule for the
     *          selecter bus stop
     * @param {Event} e event when the user clicked the refresh button
     */
    handleRefreshClick = e => {
      e.preventDefault(); // prevent default event

      if (this.state.onBusListPage && this.state.selectedBusStop !== -1) {
        this.setState({ onBusListPage: false }, () => {
          this.setActiveStopSchedule(this.state.selectedBusStop.number);
        }); // setState
      } // endif
    };

    /** handleBackArrowClick
     * @summary to handle event where the user click the back arrow button while
     *          they are on the bus list page.
     *          this function will take the user to the bus stop selection page
     * @param {Event} e event where the user clicked the back arrow button
     */
    handleBackArrowClick = e => {
      // state destructor
      const { onBusListPage, onStopListPage } = this.state;
      // make sure that the user is in the bus list page
      if (!onStopListPage && onBusListPage) {
        // change the state so that the app will render the stop list page
        this.setState({ onBusListPage: false, onStopListPage: true });
      } // endif
    };

    handleUseLocation = e => {
      e.preventDefault();
      const { onBusListPage, onStopListPage } = this.state;
      if (
        this.state.nearbyStops.length > 0 &&
        (onBusListPage || onStopListPage)
      ) {
        this.setState(
          {
            onStopListPage: false,
            onBusListPage: false,
            selectedBusStop: { name: '', number: -1 }
          }, // update state
          () => {
            this.setStopViaUserPosition();
          } // callback to set up user's position
        ); // setState
      } // if
    };

    componentDidMount() {
      this.setStopViaUserPosition();
    }

    /** setStopViaUserPosition
     * @summary this function will get the nearby stops near the user
     *
     */
    setStopViaUserPosition = () => {
      // const testData = {
      //   coords: { latitude: 49.81231, longitude: -97.1563673 }
      // };
      // this.setState({ position: testData }, () => {
      //   TransitUtil.getStops(testData.coords).then(response => {
      //     this.setupStopsAndRoutes(response.data.stops, true);
      //   });
      // });

      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({ position }, () => {
            TransitUtil.getStops(position.coords).then(response => {
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
        const busStop = this.state.activeStop.find(item => {
          return item.key === stop;
        });

        this.setState({
          onBusListPage: true,
          activeStopSchedule: schedule,
          selectedBusStop: {
            name: busStop.name,
            number: busStop.number
          }
        });
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
          return (
            <BusList
              schedule={this.state.activeStopSchedule}
              busStop={this.state.selectedBusStop}
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
            onRefresh={this.handleRefreshClick}
            onChangeHandler={this.handleSearchBarChange}
            onUseLocationHandler={this.handleUseLocation}
            onSubmitHandler={this.handleSearchBarSubmit}
            onBackHandler={this.handleBackArrowClick}
            onSchedulePage={this.state.onBusListPage}
          />

          <div style={{ width: '100%', height: '486px' }}>{RenderMain}</div>
        </Paper>
      );
    }
  }
);
