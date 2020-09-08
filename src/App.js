import React, { Component } from "react";
import { Paper, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import SearchBar from "./components/SearchBar";
import StopList from "./components/StopList";
import BusList from "./components/BusList";

import TransitUtil from "./util/TransitUtil";

const styles = (theme) => ({
  root: {
    width: 450,
    height: 550,
  },
  progress: {
    margin: theme.spacing.unit * 3,
  },
  loadingPage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
});

export default withStyles(styles)(
  class App extends Component {
    state = {
      activeStop: [],
      activeStopSchedule: [],
      allStopsRoute: [],
      nearbyStops: [],
      nearbyStopsRoute: [],
      selectedBusStop: { name: "", number: -1 },
      position: null,
      searchBarInput: "",
      onStopListPage: false,
      onBusListPage: false,
    };

    /** handleSearchBarChange
     * @summary handle changes on user input in search bar
     * @param {String} name name of component that changed (searchBarInput)
     * @param {String} value current value of the search bar
     */
    handleSearchBarChange = ({ name, value }) => {
      this.setState({
        [name]: value,
      }); // setState
    }; // end - handleSearchBarChange

    /** handleSearchBarSubmit
     * @async
     * @summary to handle the event when the user submit a search input.
     *          this will setup a new route for the searches that user submit
     * @param {Event} e event when the submit button clicked
     */
    handleSearchBarSubmit = async (e) => {
      e.preventDefault();
      const {
        position,
        searchBarInput: input,
        onBusListPage,
        onStopListPage,
      } = this.state; // destructure

      if (this.state.searchBarInput && (onBusListPage || onStopListPage)) {
        this.setState(
          {
            onStopListPage: false,
            onBusListPage: false,
            selectedBusStop: { name: "", number: -1 },
            searchBarInput: "",
          }, // states to be updated
          () => {
            if (position) {
              TransitUtil.getStops(position.coords, input)
                .then((res) => {
                  this.setupStopsAndRoutes(res.data.stops);
                }) // successful promises
                .catch((err) => {
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
    handleBusStopClick = (busStop) => {
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
    handleRefreshClick = (e) => {
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
    handleBackArrowClick = (e) => {
      // state destructor
      const { onBusListPage, onStopListPage } = this.state;
      // make sure that the user is in the bus list page
      if (!onStopListPage && onBusListPage) {
        // change the state so that the app will render the stop list page
        this.setState({ onBusListPage: false, onStopListPage: true });
      } // endif
    };

    /** handleUseLocation
     * @summary handle event where the user clicked the location button
     *          this function will first do a checking if the condition is appropriate
     *          to call the setStopViaUserPosition function
     *          if the the condition are met call the setStopViaUserPosition function
     * @param {Event} e event where the user click the location button
     */
    handleUseLocation = (e) => {
      e.preventDefault(); // prevent the default event
      // destrcucture the state
      const { onBusListPage, onStopListPage } = this.state;
      // to call setStopViaUserPosition function we need to make sure that
      // the program is not on the loading page
      // this is also to prevent multiple API calls
      if (onBusListPage || onStopListPage) {
        // the setState set the program to render the loading page and also
        // set the current selected bus stop to default, if there are any
        this.setState(
          {
            onStopListPage: false,
            onBusListPage: false,
            selectedBusStop: { name: "", number: -1 },
          }, // update state
          () => {
            this.setStopViaUserPosition();
          } // callback to set up user's position
        ); // setState
      } // endif
    };

    componentDidMount() {
      this.setStopViaUserPosition();
    }

    /** setStopViaUserPosition
     * @summary this function will get the nearby stops near the user by:
     *          1. Making a geolocation API call
     *          2. If it's successful we perform another API call from Open Data Web Service
     *             to get the nearby stops with the user latitude and longitude position
     *             If the ODWS successful, we call the setup function
     */
    setStopViaUserPosition = () => {
      const winnipegPosition = { latitude: 49.8951, longitude: -97.1384 };
      const uofmPosition = {
        latitude: 49.81011962890625,
        longitude: -97.13239288330078,
      };

      const testPosition = { latitude: 49.80946, longitude: -97.16262 };

      let options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      };

      const testRun = false;
      if (testRun) {
        this.setState({ position: uofmPosition }, () => {
          TransitUtil.getStops(testPosition).then((response) => {
            this.setupStopsAndRoutes(response.data.stops, true);
          }); // getStops
        }); // setState
      } else {
        window.navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setState({ position }, () => {
              console.log(position);
              TransitUtil.getStops(position.coords).then((response) => {
                // console.log(response);
                this.setupStopsAndRoutes(response.data.stops, true);
              }); //getStopsFromPosition
            }); // Set State
          }, // callback if geolocation was successful
          (err) => {
            console.log(err.message);
            // If there's error on geolocation use winnipeg's position
            this.setState({ position: winnipegPosition }, () => {
              TransitUtil.getStops(winnipegPosition).then((response) => {
                this.setupStopsAndRoutes(response.data.stops, true);
              }); //getStopsFromPosition
            }); // Set State
          }, // callback if geolocation result in error
          options
        ); // Geolocation call
      }
    }; // setStopViaUserPosition

    /** setupStopsAndRoutes
     * @summary to set up the stops and the routes inside the stops
     * @param {Array} stopsList a list of stops from ODWS API call
     * @param {Boolean} useLocation indicates if the stops that we set are stops nearby
     */
    setupStopsAndRoutes = (stopsList, useLocation = false) => {
      let allStopsRoute = []; // init empty array of stops and routes pair

      /** runPromises
       * @summary this function will do an API call to look for routes for every stops in
       *          stopsList, EXCEPT the last stops
       *          this also to make sure that every promises are successful before
       *          we exit setupStopsAndRoutes
       * @return {Promise} result
       */
      const runPromises = () => {
        let result = Promise.resolve(TransitUtil.getRoute(stopsList[0].key));

        for (let i = 1; i < stopsList.length; i++) {
          result = result.then((res) => {
            // we push a bus stop number and routes pair to our array result allStopsRoute
            allStopsRoute.push({
              key: stopsList[i - 1].key,
              routes: res.data.routes,
            }); // push
            return TransitUtil.getRoute(stopsList[i].key);
          }); // then, response
        } // end for

        return result;
      };

      // this will run the last promise for the last stops
      runPromises().then((res) => {
        const lastKey = stopsList[stopsList.length - 1].key;
        allStopsRoute.push({ key: lastKey, routes: res.data.routes });
        // set program state accordingly
        if (useLocation) {
          this.setState({
            nearbyStops: stopsList,
            nearbyStopsRoute: allStopsRoute,
            activeStop: stopsList,
            allStopsRoute,
            onStopListPage: true,
            onBusListPage: false,
          }); // setState
        } // if
        else {
          this.setState({
            activeStop: stopsList,
            allStopsRoute,
            onStopListPage: true,
            onBusListPage: false,
          }); // setState
        } // else
        // endif
      }); // runPromises, then, response
    };

    /** setActiveStopSchedule
     * @summary to set up bus list page that contains all the schedule for the stop
     * @param {Number} stop the number of bus stop that will be use to perform an API call
     *                      to get the schedule
     */
    setActiveStopSchedule = (stop) => {
      TransitUtil.getSchedule(stop).then(({ data }) => {
        const schedule = TransitUtil.parseSchedule(data); // parse the schedule
        // find the bus stop that we looking for from our activeStop state
        const busStop = this.state.activeStop.find((item) => {
          return item.key === stop;
        }); // busStop

        this.setState({
          onBusListPage: true,
          activeStopSchedule: schedule,
          selectedBusStop: {
            name: busStop.name,
            number: busStop.number,
          },
        }); // setState
      }); // then, response
    };

    render() {
      const { searchBarInput } = this.state;
      const { classes } = this.props;

      /**
       * @summary the purpose of this function is to do a conditional render
       *          there are 3 pages in this program bus list, stop list, and loading page
       *          the rendering will depends on the two states which are:
       *          onStopListPage and onBusListPage
       */
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
        // endif
      }; // conditionalRender

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

          <div style={{ width: "100%", height: "486px" }}>{RenderMain}</div>
        </Paper>
      );
    }
  }
);
