const express = require("express");
var router = express.Router();
const dbConfig = require('../config/dbConfig.js');
const connection = require('../helpers/connection');
const query = require('../helpers/query');
const axios = require('axios');
const moment = require('moment');

/* upload  geo-points*/
router.post('/api/v1.0/upload', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const { rows, uuid } = req.body;

    for (let i = 0; i < rows.length; i++) {
      rows[i].push(uuid);
    }

    var jString = JSON.stringify(rows);
    jString = jString.substr(1);
    jString = jString.substring(0, jString.length - 1);
    jString = jString.replace(/\[/g, "(");
    jString = jString.replace(/\]/g, ")");

    const sql = `CALL sp_upload_geo_points(${JSON.stringify(uuid)},${JSON.stringify(jString)})`;
    await query(conn, sql).then(
      response => {
        res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
      })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });
  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });
  }


});

// view request ids
router.get('/api/v1.0/request-id-all', async (req, res) => {
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = 'CALL sp_fetch_request_ids()';
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });
});

// fetch geo-points based on uuid
router.get('/api/v1.0/fetch-geo-points/:uuid', async (req, res) => {
  const conn = await connection(dbConfig).catch(e => { return e; });
  const { uuid } = req.params;
  const sql = `CALL sp_fetch_geo_points(${JSON.stringify(uuid)})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });
});


// invoke power NASA api
router.post('/api/v1.0/nasa-power', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const { rec_id, start_date, end_date, longitude, latitude } = req.body;
    const api_url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=RE&longitude=${longitude}&latitude=${latitude}&start=${start_date}&end=${end_date}`;
    await axios.get(api_url)
      .then(
        response => {
          let results = response.data.properties.parameter.T2M;
          let resuts_array = Object.values(results);
          let sql_string = 'INSERT INTO geo_point_weather_data(rec_id,YEAR,MO,DY,T2M) VALUES';
          
          let new_date = null;
          let year = null;
          let month = null;
          let day = null;

          for (let i = 0; i < resuts_array.length; i++) {

            new_date = moment(start_date, "YYYYMMDD").add(i,'days');
            year = moment(new_date,"YYYYMMDD").format('YYYY');
            month = moment(new_date,"YYYYMMDD").format('MM');
            day = moment(new_date,"YYYYMMDD").format('DD');

            let delim = (i+1 === resuts_array.length) ? `;` : ',';
            sql_string += `(${rec_id},${year},${month},${day},${resuts_array[i]})${delim}`;

            year = null;
            month = null;
            day = null;
          }
          let sql = `call sp_save_geo_points_weather_data(${rec_id},${JSON.stringify(sql_string)})`;  
          
           query(conn, sql).then(
            response => {
              res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
            })
            .catch(e => { res.status(400).json({ status: 400, message: e }) });

        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

      

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` })
  }
});
















// actions on  batch i.e validation or discard or progress &  post
router.post('/api/v1.0/batches/action', async (req, res) => {
  try {
    const { action, uuid, user } = req.body;
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = `CALL sp_batch_process_action(${JSON.stringify(uuid)},${action},${user})`;
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {

    res.send({ status: 0, message: `system error! ${error.message}` })
  }
});

// view unfinalized batch records based on organization and batch. Filters -> org_id, batch,stage,status,action
router.get('/api/v1.0/batches/view/:type/:stage/:status/:org/:user/:action', async (req, res) => {
  const { org, user, type, stage, status, action } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_process_view_records(${isNaN(type) ? null : type},${isNaN(stage) ? null : stage},${isNaN(status) ? null : status},${org},${user},${action})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });

});


// view deleted batches based on organization and step. 
router.get('/api/v1.0/batches/deleted/:type/:org/:user', async (req, res) => {
  const { org, user, type } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_process_view_deleted_records(${type},${org},${user})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });

});


// view POSTED batches based on organization and step. 
router.get('/api/v1.0/batches/posted/:type/:org/:user', async (req, res) => {
  const { org, user, type } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_process_view_posted_batches(${type},${org},${user})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });

});

// view  details of a batch record
router.get('/api/v1.0/batches/details/:record_id/:batch_type/:option', async (req, res) => {
  const { record_id, batch_type, option } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_process_view_record(${record_id},${batch_type},${option})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });
});

router.get('/api/v1.0/batches/template/:type/:org', async (req, res) => {
  const { org, type } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_get_template(${type},${org})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });

});




//get batch record using record id
router.get('/api/v1.0/batches/record/any/:batch_type/:record_id', async (req, res) => {
  const { batch_type, record_id } = req.params;
  const conn = await connection(dbConfig).catch(e => { return e; });
  const sql = `CALL sp_batch_view_record(${batch_type},${record_id})`;
  await query(conn, sql).then(response => { res.status(200).json({ payload: response[0] }) }).catch(e => { res.status(400).json({ status: 400, message: e }) });
});

router.put('/api/v1.0/batches/milking/modify-and-revalidate', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const { amount_afternoon, amount_morning, amount_noon, animal_id, milk_date, record_id, user_id, batch_type, remove } = req.body;
    const sql = `CALL sp_batch_milking_modify_revalidate(${amount_afternoon},${amount_morning},${amount_noon},${animal_id},${JSON.stringify(milk_date)},${record_id},${user_id},${batch_type},${remove})`;
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` })
  }

});

router.put('/api/v1.0/batches/weight/modify-and-revalidate', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const { body_length, body_score, body_weight, heart_girth, weight_date, animal_id, remove, record_id, user_id, batch_type } = req.body;

    const sql = `CALL sp_batch_weight_modify_revalidate(${body_length},${body_score},${body_weight},${heart_girth},${JSON.stringify(weight_date)},${animal_id},${remove},${record_id},${user_id},${batch_type})`;
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` })

  }
});

router.put('/api/v1.0/batches/ai/modify-and-revalidate', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const { ai_tech, ai_type_id, animal_id, batch_type, body_score, cost, record_id, remove, service_date, straw_id, user_id } = req.body;
    const sql = `CALL sp_batch_ai_modify_revalidate(${ai_tech},${straw_id},${body_score},${ai_type_id},${cost},${JSON.stringify(service_date)},${animal_id},${remove},${record_id},${user_id},${batch_type})`;
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});


router.put('/api/v1.0/batches/animal/modify-and-revalidate', async (req, res) => {
  try {

    const conn = await connection(dbConfig).catch(e => { return e; });
    const {
      record_id,
      user_id,
      Purchase_cost,
      altitude,
      animal_name,
      animal_photo,
      approx_age,
      breed_composition_id,
      color_id,
      dam_known_id,
      dam_tag_id,
      date_of_birth,
      deformaties_id,
      derived_birth_date,
      entry_date,
      entry_type_id,
      farmer_name,
      grps_accuracy,
      hair_sample_id,
      latitude,
      longitute,
      main_breed_id,
      reg_date,
      secondary_breed_id,
      sex_id,
      sire_known_id,
      sire_tag_id,
      sire_type_id,
      tag_id,
      tag_prefix,
      tag_sequence,
      remove
    } = req.body;

    const sql = `CALL sp_batch_animal_modify_revalidate(
      ${record_id},
        ${user_id},     
          ${Purchase_cost},
            ${JSON.stringify(altitude)},
              ${JSON.stringify(animal_name)},
                ${JSON.stringify(animal_photo)},
                  ${JSON.stringify(approx_age)},
                    ${breed_composition_id},
                      ${color_id},
                        ${dam_known_id},
                          ${JSON.stringify(dam_tag_id)},
                            ${JSON.stringify(date_of_birth)},
                              ${deformaties_id},
                                ${JSON.stringify(derived_birth_date)},
                                  ${JSON.stringify(entry_date)},
                                    ${entry_type_id},
                                      ${JSON.stringify(farmer_name)},
                                        ${JSON.stringify(grps_accuracy)},
                                          ${JSON.stringify(hair_sample_id)},
                                            ${JSON.stringify(latitude)},
                                              ${JSON.stringify(longitute)},
                                                ${main_breed_id},
                                                  ${JSON.stringify(reg_date)},
                                                    ${secondary_breed_id},
                                                      ${sex_id},
                                                        ${sire_known_id},
                                                          ${JSON.stringify(sire_tag_id)},
                                                            ${sire_type_id},
                                                              ${JSON.stringify(tag_id)},
                                                                ${JSON.stringify(tag_prefix)},
                                                                  ${JSON.stringify(tag_sequence)},  
                                                                    ${remove}
      )`;

    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ status: response[0][0].status, message: response[0][0].message })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` })

  }
});

// VIEW BATCH TYPES
router.get('/api/v1.0/batches/types/all', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = "SELECT id,name FROM interface_batch_types";
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ payload: response })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});

// VIEW BATCH STAGES
router.get('/api/v1.0/batches/stages/all', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = "SELECT step id,name FROM interface_batch_stages";
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ payload: response })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});

// VIEW BATCH STATUS
router.get('/api/v1.0/batches/status/all', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = "SELECT id,name FROM interface_batch_status";
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ payload: response })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});

// VIEW BATCH VALIDATION STATUS
router.get('/api/v1.0/batches/validation-status/all', async (req, res) => {
  try {
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = "SELECT id,name from interface_batch_records_status";
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ payload: response })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});
// VIEW BATCH REPORT ALL
router.get('/api/v1.0/batches/report/all/:org/:type/:stage/:status/:user', async (req, res) => {
  try {
    const { org, type, stage, status, user } = req.params;
    const conn = await connection(dbConfig).catch(e => { return e; });
    const sql = `CALL sp_rpt_batch_all(${org},${type},${stage},${status},${user})`;
    await query(conn, sql)
      .then(
        response => {
          res.status(200).json({ payload: response })
        })
      .catch(e => { res.status(400).json({ status: 400, message: e }) });

  } catch (error) {
    res.send({ status: 0, message: `system error! ${error.message}` });

  }
});
module.exports = router