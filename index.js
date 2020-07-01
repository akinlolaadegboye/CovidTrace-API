const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser= require('body-parser');
app.use(cors({ origin: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const admin = require('firebase-admin');
let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();



app.post('/api/v1/create-user', (req, res) => {
  
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phonenumber = req.body.phonenumber;
  const emailaddress = req.body.emailaddress;
  const password = req.body.password;

  if(!firstname || !lastname || !phonenumber || !emailaddress || !password)
  return res.status(200).send(
    {
      "status":"200",
      "message":"Some required parameters missing"
    }
  );

  (async () => {
      try {
       
        await db.collection('users').doc(req.body.emailaddress)
            .create({
              firstname:firstname,
              lastname:lastname,
              phonenumber:phonenumber,
              emailaddress:emailaddress,
              password:password
            });
            
        return res.status(200).send(
          {
            "status":"1",
            "message":`User ${firstname+' '+lastname} created successfully`
          }
          );
      } catch (error) {
        console.log(error);
        return res.status(500).send({
          "status":"0",
          "message":"Email already exit"
        });
      }
    })();
});


app.post('/api/v1/login', (req,res) => {
  (async () => {
    try {

      const emailaddress= req.body.emailaddress;
      const password = req.body.password;

      if(!emailaddress || !password) return res.status(200).send({
        "status":"0",
        "message":"One or more parameters empty"
      });

        let query = db.collection('users').doc(emailaddress);
        console.log(query);
       
        let response = [];
        await query.get().then(querySnapshot => {
        
        let passwordFromDatabase = querySnapshot._fieldsProto.password.stringValue;
        if(req.body.password == passwordFromDatabase){
          return res.status(200).send({
            "status":"1",
            "messsage":"login successful!"
          });
        }else{
          return res.status(200).send({
            "status":"0",
            "messsage":"Wrong password!"
          });
        }
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});


app.get('/', (req, res) => {
  res.status(200).send(
    {
      "message": "Welcome to Covid Trace App",
      response
    });
  });

  app.get('/api/v1/get-all-users', (req, res) => {
    (async () => {
        try {
            let query = db.collection('users');
            let response = [];
            await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = doc.data();
                response.push(
                  selectedItem
                  );
            }
            });
            return res.status(200).send(
              {
                "message": "All users fetched succesfully",
                response
              });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

app.get('/api/v1/get-all-patients', (req, res) => {
  (async () => {
      try {
          let query = db.collection('patients');
          let response = [];
          await query.get().then(querySnapshot => {
          let docs = querySnapshot.docs;
          for (let doc of docs) {
              const selectedItem = doc.data();
              response.push(
                selectedItem
                );
          }
          });
          return res.status(200).send(
            {
              "status":"0",
              "message": "All patients fetched succesfully",
              response
            }
            );
      } catch (error) {
          console.log(error);
          return res.status(500).send(error);
      }
      })();
  });

  app.post('/api/v1/create-patient', (req, res) => {

  const name = req.body.name;
  const phonenumber = req.body.phonenumber;
  const address = req.body.address;
  const dateinlocation = req.body.dateinlocation;
 

  if(!name || !phonenumber || !phonenumber || !dateinlocation )
  return res.status(200).send(
    {
      "status":"200",
      "message":"Some required parameters missing"
    }
  );

    (async () => {
      db.collection("patients").add(
       {
         name:name,
         phonenumber:phonenumber,
         address:address,
         dateinlocation:dateinlocation
       }
      )
    .then(function(docRef) {
      res.send({
        "status":"1",
        "message":"patient inserted succesfully"
      });
    })
    .catch(function(error) {
    });
      })();

  });


  app.get('/api/v1/get-all-reports', (req,res) => {

    (async () => {
      try {
          let query = db.collection('reports');
          let response = [];
          await query.get().then(querySnapshot => {
          let docs = querySnapshot.docs;
          for (let doc of docs) {
              const selectedItem = doc.data();
              response.push(selectedItem);
          }
          });
          return res.status(200).send({
            "status":"1",
            "messsage":"all reports fetched successfully.",
            response
          }
          );
      } catch (error) {
          console.log(error);
          return res.status(500).send(error);
      }
      })();
  });



  app.post('/api/v1/create-report', (req, res) => {

    const name = req.body.name;
    const phonenumber = req.body.phonenumber;
    const address = req.body.address;
    const message = req.body.message;

    if(!name || !phonenumber || !phonenumber || !message )
    return res.status(200).send(
      {
        "status":"200",
        "message":"Some required parameters missing"
      }
    );

    (async () => {

      db.collection("reports").add(
       {
         name:name,
         phonenumber:phonenumber,
         address:address,
         message:message,
         date:Date.now
       }
      )
    .then(function(docRef) {
      res.send(
        {
          "status":"1",
          "message":"Report inserted successfully"
        }
      );
    })
    .catch(function(error) {
    });
   })();
      
  });

 var listener= app.listen(3000, function(){
  console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});

exports.app = functions.https.onRequest(app);
