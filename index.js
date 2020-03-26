'use strict'

const oneDay = 86400;
const noop = function (){};
module.exports = function( session ){
    const Store = session.Store;
    function CouchbaseStore(options) {
        let self = this;
        options = options || {};
        Store.call(this, options);
        this.prefix = null == options.prefix
            ? 'sess:'
            : options.prefix;
        let connectOptions = {};
        if(options.hasOwnProperty("host")){
            connectOptions.host = options.host;
        }else if(options.hasOwnProperty("hosts")){
            connectOptions.host = options.hosts;
        }
        if(options.hasOwnProperty("username")){
            connectOptions.username = options.username;
        }
        if(options.hasOwnProperty("password")){
            connectOptions.password = options.password;
        }
        if(options.hasOwnProperty("bucket")){
            connectOptions.bucket = options.bucket;
        }
        if(options.hasOwnProperty("cachefile")){
            connectOptions.cachefile = options.cachefile;
        }
        if(options.hasOwnProperty("connectionTimeout")){
            connectOptions.connectionTimeout = options.connectionTimeout;
        }
        if(options.hasOwnProperty("operationTimeout")){
            connectOptions.operationTimeout = options.operationTimeout;
        }
        if(options.hasOwnProperty("db")){
            connectOptions.db = options.db; // DB Instance
        }
        if( typeof(connectOptions.db) != 'undefined' ){
            this.client = connectOptions.db;
        }else{
            const Couchbase = require('couchbase');
            let cluster = new Couchbase.Cluster(connectOptions.host);
            if(connectOptions.username && connectOptions.password){
              cluster.authenticate(connectOptions.username,connectOptions.password);
            }
            this.client = cluster.openBucket(connectOptions.bucket,  function(err){
                if (err){
                    log("Could not connect to couchbase with bucket: " + connectOptions.bucket);
                    self.emit('disconnect');
                }else{
                    self.emit('connect');
                }
            });
        }
        this.client.connectionTimeout = connectOptions.connectionTimeout || 10000;
        this.client.operationTimeout = connectOptions.operationTimeout || 10000;
        this.ttl = options.ttl || null;
    }
    CouchbaseStore.prototype.__proto__ = Store.prototype;
    CouchbaseStore.prototype.get = function(sid, fn){
        if ('function' !== typeof fn) { fn = noop; }
        sid = this.prefix + sid;
        log('GET '+sid);
        this.client.get(sid, function(err, data){
            if (err && err.code == 13) {
                return fn();
            }
            if (err) return fn(err);
            if (!data || !data.value) return fn();
            var result;
            data = data.value.toString();
            log('GOT '+ data);
            try {
                result = JSON.parse(data);
            } catch (err) {
                return fn(err);
            }
            return fn(null, result);
        });
    };
    CouchbaseStore.prototype.set = function(sid, sess, fn){
        if ('function' !== typeof fn) { fn = noop; }
        sid = this.prefix + sid;
        try {
            var maxAge = sess.cookie.maxAge
                , ttl = this.ttl
                , sess = JSON.stringify(sess);
            ttl = ttl || ('number' == typeof maxAge
                ? maxAge / 1000 | 0
                : oneDay);
            log('SETEX'+sid+'ttl:'+ttl+' '+sess);
            this.client.upsert(sid, sess, {expiry:ttl}, function(err){
                err || log('Session Set complete');
                fn && fn.apply(this, arguments);
            });
        } catch (err) {
            fn && fn(err);
        }
    };
    CouchbaseStore.prototype.destroy = function(sid, fn){
        if ('function' !== typeof fn) { fn = noop; }
        sid = this.prefix + sid;
        this.client.remove(sid, fn);
    };
    CouchbaseStore.prototype.touch = function (sid, sess, fn) {
        if ('function' !== typeof fn) { fn = noop; }
        var maxAge = sess.cookie.maxAge
            , ttl = this.ttl
            , sess = JSON.stringify(sess);
        ttl = ttl || ('number' == typeof maxAge
                ? maxAge / 1000 | 0
                : oneDay);
        log('EXPIRE'+sid+' ttl:'+ttl);
        this.client.touch(this.prefix + sid, ttl, fn);
    };
    return CouchbaseStore;
};
const log = ( msg ) => {
  // TODO: bring in logging.
  console.log( msg );
};
