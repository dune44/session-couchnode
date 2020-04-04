// Bring in protected config failed
const config = require( '../.config/db' );

const expressSession = require( 'express-session' );
const sessionCouchnode = require( '../index' )( expressSession );
const moment = require('moment');
const chai = require( 'chai' );
const expect = chai.expect;

const couchbaseStore = new sessionCouchnode({
    bucket: config.bucket,
    username: config.username,
    password: config.password,
    host: config.host,
    connectionTimeout: 2000,
    operationTimeout: 2000,
    ttl: 86400
});

const user = {
  _id: 123,
  username: 'fred'
};
const sid = '';
let cookie = {
    "path": '/',
    "_expires":moment().add(86400000, 'seconds').format(),
    "originalMaxAge": 86400000,
    "httpOnly": true
}
const session = { cookie, user };
/*
Special Notice: This a chicken before egg project.  I adopted this from someone who did not write tests. I am adding these now for testing moving fwd.
*/

describe( 'CouchbaseStore prototype function checks', () => {

  let setError,
      getError,
      getSession;

  function runSet( next ) {
    couchbaseStore.set( sid, session, ( error ) => {
      setError = error;
      next();
    });
  }

  function runGet( next ) {
    couchbaseStore.get( sid, ( error, session ) => {
      getError = error;
      getSession = session;
      console.log('error');
      console.log(error);
      console.log('session');
      console.log(session);
      next();
    });
  }

  before( ( done ) => {
    runSet( () => {
      runGet( done );
    });
  });

  after( done => done() );

  /*
  store.get(sid, callback)

  Required

  This required method is used to get a session from the store given a session ID (sid). The callback should be called as callback(error, session).

  The session argument should be a session if found, otherwise null or undefined if the session was not found (and there was no error). A special case is made when error.code === 'ENOENT' to act like callback(null, null).
  */


  describe( 'Get', () => {

    // Property Existence
    it( 'Should return error', () => {
      expect(getError).to.have.be( null );
    });
  });

  /*
  store.set(sid, session, callback)

  Required

  This required method is used to upsert a session into the store given a session ID (sid) and session (session) object. The callback should be called as callback(error) once the session has been set in the store.
  */


  describe( 'Set', () => {

  });

  /*
  store.destroy(sid, callback)
  This required method is used to destroy/delete a session from the store given a session ID (sid). The callback should be called as callback(error) once the session is destroyed.
  */
  function runGet() {
    //couchbaseStore.Destroy()
  }

  describe( 'Destroy', () => {

  });


  /*
  store.touch(sid, session, callback)

  Recommended

  This recommended method is used to "touch" a given session given a session ID (sid) and session (session) object. The callback should be called as callback(error) once the session has been touched.

  This is primarily used when the store will automatically delete idle sessions and this method is used to signal to the store the given session is active, potentially resetting the idle timer.
  */
  function runGet() {
    //couchbaseStore.Touch()
  }

  describe( 'Touch', () => {

  });

// Todo: All, Clear, and length
/*
store.all(callback)

Optional

This optional method is used to get all sessions in the store as an array. The callback should be called as callback(error, sessions).
------------------
store.clear(callback)

Optional

This optional method is used to delete all sessions from the store. The callback should be called as callback(error) once the store is cleared.
------------------
store.length(callback)

Optional

This optional method is used to get the count of all sessions in the store. The callback should be called as callback(error, len).
*/

});
