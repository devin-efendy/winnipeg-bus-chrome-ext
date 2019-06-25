import axios from 'axios';

// This is to make the base of the API call
export default axios.create({
  baseURL: 'https://api.winnipegtransit.com/v3'
});
