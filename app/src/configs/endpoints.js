import {api,headers} from '../configs';

export const endpoint_upload = {
  url: `${api}/upload`,
  method: 'POST',
  headers: headers   
};

//Request ID all
export const endpoint_request_id_all = {
  url: `${api}/request-id-all`,
  method: 'GET',
  headers: headers   
}; 


//fetch geo points
export const endpoint_fetch_geo_points = {
  url: `${api}/fetch-geo-points`,
  method: 'GET',
  headers: headers   
}; 


//Request ID all
export const endpoint_power_nasa_api_call = {
  url: `${api}/nasa-power`,
  method: 'POST',
  headers: headers   
}; 






