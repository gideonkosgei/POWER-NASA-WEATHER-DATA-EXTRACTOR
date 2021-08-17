const axios = require('axios');

/*  GENERIC 2 PARAMETERS  */
export const genericFunctionTwoParameters = function (param1, param2) {   
  const options = {
    url: `${param1.url}`,
    method: param1.method,
    headers: param1.headers
  }
  console.log(options);
  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      }).catch(err => reject(err));
  });
}

/*  GENERIC 3 PARAMETERS  */
export const genericFunctionThreeParameters = function (param1, param2, param3) {
  // console.log(param2);  
  const options = {
    url: `${param1.url}/${param3}`,
    method: param1.method,
    headers: param1.headers
  }

  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      }).catch(err => reject(err));
  });
}


/*  GENERIC 6 PARAMETERS  */
export const genericFunctionSixParameters = function (param1, param2, param3, param4, param5, param6) {

  const options = {
    url: `${param1.url}/${param3}/${param4}/${param5}/${param6}`,
    method: param1.method,
    headers: param1.headers
  }

  console.log(options);
  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      }).catch(err => reject(err));
  });
}

/*  GENERIC 7 PARAMETERS  */
export const genericFunctionSevenParameters = function (param1, param2, param3, param4, param5, param6, param7) {
  const options = {
    url: `${param1.url}/${param3}/${param4}/${param5}/${param6}/${param7}`,
    method: param1.method,
    headers: param1.headers
  }

  console.log(options);

  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      }).catch(err => reject(err));
  });
}


//upload
export const upload = function (config, rows, cols,uuid) {

  const body = {
    "rows": rows,
    "cols": cols,
    "uuid": uuid
  };

  const options = {
    url: `${config.url}`,
    method: config.method,
    headers: config.headers,
    data: body
  };

  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      })
      .catch(err =>
        reject(err));
  });
}


//upload
export const process = function (config,rec_id,long,lat,start_date,end_date,uuid) {

  const body = {
    "rec_id": rec_id,
    "longitude": long,
    "latitude": lat,
    "end_date" : end_date,
    "start_date" : start_date,
    "uuid" :uuid 
  };

  const options = {
    url: `${config.url}`,
    method: config.method,
    headers: config.headers,
    data: body
  };

  return new Promise((resolve, reject) => {
    axios(options)
      .then(res => {
        resolve(res.data);
      })
      .catch(err =>
        reject(err));
  });
}















































































