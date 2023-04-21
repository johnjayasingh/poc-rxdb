import {
    createRxDatabase,
    addRxPlugin
} from 'rxdb';
import {
    getRxStorageDexie
} from 'rxdb/plugins/storage-dexie';
import {
    heroSchema,
    edgeSchema,
    nodeSchema,
    editorSchema,
    profileSchema
} from './Schema';

import { replicateCouchDB } from 'rxdb/plugins/replication-couchdb';

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBMigrationPlugin);

const syncURL = 'http://localhost:10102/';
console.log('host: ' + syncURL);

let dbPromise = null;

const _create = async () => {
    console.log('DatabaseService: creating database..');
    const db = await createRxDatabase({
        name: 'heroesreactdb',
        storage: getRxStorageDexie()
    }).catch(console.error);
    console.log('DatabaseService: created database');
    window['db'] = db; // write to window for debugging

    // show leadership in title
    db.waitForLeadership().then(() => {
        console.log('isLeader now');
        document.title = '♛ ' + document.title;
    });

    // create collections
    console.log('DatabaseService: create collections');
    await db.addCollections({
        heroes: {
            schema: heroSchema,
            methods: {
                hpPercent() {
                    return this.hp / this.maxHP * 100;
                }
            },
            migrationStrategies: {
                0: function(oldDoc) {
                  return oldDoc
                },
                // 1 means, this transforms data from version 0 to version 1
                1: function(oldDoc) {
                  return oldDoc
                },
            }
        },
        nodes: {
            schema: nodeSchema,
            methods: {
                hpPercent() {
                    return this.hp / this.maxHP * 100;
                }
            },
            migrationStrategies: {
                0: function(oldDoc) {
                  return oldDoc
                },
                // 1 means, this transforms data from version 0 to version 1
                1: function(oldDoc) {
                  return oldDoc
                },
            }
        },
        edges: {
            schema: edgeSchema,
            methods: {
                hpPercent() {
                    return this.hp / this.maxHP * 100;
                }
            },
            migrationStrategies: {
                0: function(oldDoc) {
                  return oldDoc
                },
                // 1 means, this transforms data from version 0 to version 1
                1: function(oldDoc) {
                  return oldDoc
                },
            }
        },
        editor: {
            schema: editorSchema,
            methods: {
                hpPercent() {
                    return this.hp / this.maxHP * 100;
                }
            },
            migrationStrategies: {
                0: function(oldDoc) {
                  return oldDoc
                },
                // 1 means, this transforms data from version 0 to version 1
                1: function(oldDoc) {
                  return oldDoc
                },
            }
        },
        profile: {
            schema: profileSchema,
            methods: {
                hpPercent() {
                    return this.hp / this.maxHP * 100;
                }
            },
            migrationStrategies: {
                0: function(oldDoc) {
                  return oldDoc
                },
                // 1 means, this transforms data from version 0 to version 1
                1: function(oldDoc) {
                  return oldDoc
                },
            }
        },
    });

    // hooks
    console.log('DatabaseService: add hooks');
    db.collections.heroes.preInsert(docObj => {
        const { color } = docObj;
        return db.collections.heroes.findOne({
            selector: { color }
        }).exec().then(has => {
            if (has !== null) {
                alert('another hero already has the color ' + color);
                throw new Error('color already there');
            }
            return db;
        });
    });

    // sync
    console.log('DatabaseService: sync');
    await Promise.all(
        Object.values(db.collections).map(async (col) => {
            try {
                // create the CouchDB database
                await fetch(
                    syncURL + col.name + '/',
                    {
                        method: 'PUT'
                    }
                );
            } catch (err) { }
        })
    );
    console.log('DatabaseService: sync - start live');
    Object.values(db.collections).map(col => col.name).map(colName => {
        console.log('colName', colName)
        const url = syncURL + colName + '/';
        console.log('url: ' + url);
        const replicationState = replicateCouchDB(
            {
                collection: db[colName],
                // url to the CouchDB endpoint (required)
                url,
                /**
                 * true for live replication,
                * false for a one-time replication.
                * [default=true]
                */
                live: true,
                /**
                 * A custom fetch() method can be provided
                 * to add authentication or credentials.
                 * Can be swapped out dynamically
                 * by running 'replicationState.fetch = newFetchMethod;'.
                 * (optional)
                 */
                // fetch: myCustomFetchMethod,
                pull: {
                    /**
                     * Amount of documents to be fetched in one HTTP request
                     * (optional)
                     */
                    batchSize: 60,
                    /**
                     * Custom modifier to mutate pulled documents
                     * before storing them in RxDB.
                     * (optional)
                     */
                    // modifier: docData => {/* ... */ },
                    /**
                     * Heartbeat time in milliseconds
                     * for the long polling of the changestream.
                     * @link https://docs.couchdb.org/en/3.2.2-docs/api/database/changes.html
                     * (optional, default=60000)
                     */
                    heartbeat: 60000
                },
                push: {
                    /**
                     * How many local changes to process at once.
                     * (optional)
                     */
                    batchSize: 60,
                    /**
                     * Custom modifier to mutate documents
                     * before sending them to the CouchDB endpoint.
                     * (optional)
                     */
                    // modifier: docData => {/* ... */ }
                }
            }
        );
        replicationState.error$.subscribe(err => {
            console.log('Got replication error:');
            console.dir(err);
        });
    });

    return db;
};

export const get = () => {
    if (!dbPromise)
        dbPromise = _create();
    return dbPromise;
};
