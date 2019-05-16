import React, { Component } from 'react';

import { TextField, IconButton, Grid } from '@material-ui/core';
import { Refresh, Search } from '@material-ui/icons';

class SearchBar extends Component {
  render() {
    return (
      <form
        onSubmit={e => {
          this.props.onSubmitHandler(e);
        }}
        className={this.props.formClass}
      >
        <Grid container spacing={24}>
          <Grid item xs={8}>
            <TextField
              className={this.props.searchClass}
              name="searchBarInput"
              label="Location"
              value={this.props.inputValue}
              onChange={({ target: { name, value } }) => {
                this.props.onChangeHandler({ name, value });
              }}
              fullWidth={true}
              style={{ bottom: '2px' }}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton type="submit" color="primary">
              <Search fontSize="large" />
            </IconButton>
          </Grid>
          <Grid item xs={2}>
            <IconButton color="primary" style={{ bottom: '1px' }}>
              <Refresh fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default SearchBar;
