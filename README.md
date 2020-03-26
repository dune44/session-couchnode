# session-couchnode
Add a Couchbase Store for login sessions.
This package is designed specifically to work as storage for express-session.

# Installing
To install the lastest release using npm, run:

```bash
npm install session-couchnode
```
# Usage
session-couchnode takes in express-sessions

```bash
const session = require('express-session');
const session-couchnode = require('session-couchnode')(session);
```
Next you will need to set the options

```bash
const couchbaseStore = new CouchbaseStore({
    bucket: 'yourBucketName',
    username: 'couchbaseBucketAdminUsername',
    password: 'KeepItSecretKeepItSafe',
    host:"Address:Port",
    connectionTimeout: 2000,
    operationTimeout: 2000,
    ttl: 86400
});
```
Example of usage within Express Sessions options

```bash
app.use(session({
    secret: 's3kr8T ',
    resave: false,
    store: couchbaseStore,
    saveUninitialized: false,
    cookie: {maxAge:24*60*60*1000} //stay open for 1 day of inactivity
}));
```

You may also wish to add logging for connecting
```bash
couchbaseStore.on('connect', function(e){
  if(e) console.log(e);
  else console.log("Couchbase Session store is ready for use");
});
```
You may also wish to add logging for disconnecting
```bash
couchbaseStore.on('disconnect', function(e){
  if(e) console.log(e);
  else console.log("An error occurred connecting to Couchbase Session Storage");
});
```
