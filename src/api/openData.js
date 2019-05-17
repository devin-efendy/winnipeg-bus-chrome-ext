import axios from 'axios';

export default axios.create({
  baseURL: 'https://api.winnipegtransit.com/v3'
});
