import fp from 'fastify-plugin'
import neo4j from 'neo4j-driver';
import { getQuery } from '../cypher/QueryManager';

export interface DatabaseAdapterPluginOptions {
  // Specify DatabaseAdapter plugin options here
}

interface Neo4jResult {
  keys: any[],
  records: any[],
  summary: any
}

const URI = 'neo4j+s://5aa1b79c.databases.neo4j.io';
const USERNAME = 'neo4j';
const PASSWORD = 'Xc4sMnRvQGKZmQ-qOn_TSzKPxJUhWWFmaqgk3L7ZCuQ';
let driver: any;

const connect = async () => {
  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log('Connected ' + serverInfo);
  } catch (err) {
    console.error(err);
  }
}

const parseNeo4jObject = (neo4jObject: Neo4jResult) => {
  const parsedObject: any[] = [];

  for (const record of neo4jObject.records) {
    const recordObj = {};
    for (const keyIndex in neo4jObject.keys) {
      const key = neo4jObject.keys[keyIndex];
      recordObj[key] = record['_fields'][keyIndex];
    }

    parsedObject.push(recordObj);
  }

  return parsedObject;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<DatabaseAdapterPluginOptions>(async (fastify, opts) => {

  fastify.decorate('sendChat', async function(username: string, room: string, message: string): Promise<void> {
    connect();
    const cqlQuery = await getQuery('SendChat');
    console.log(`cqlQuery: ${cqlQuery}`);
    await driver.executeQuery(
      cqlQuery,
      { username, room, message },
      { database: 'neo4j' }
    );
    // TODO: Check room, user and message all exist and validate

    await driver.close();
  })

  fastify.decorate('getChats', async function(room: string, from?: string) {
    connect();

    const fromDate = from != null ? from : '1970-01-01';
    console.log(`From: ${from?.toString()} - fromDate: ${fromDate.toString()}`)
    // const cqlQuery = 'MATCH (r:Room {name: $room})-[c:CONTAINS]->(m:Chat)-[s:SENT_BY]->(u) WHERE m.created > datetime($fromDate) RETURN m.message AS message, apoc.date.toISO8601(m.created.epochMillis, "ms") AS created, u.username AS username;';

    const cqlQuery = await getQuery('GetChats');
    const result = await driver.executeQuery(
      cqlQuery,
      { room, fromDate },
      { database: 'neo4j' }
    );
    await driver.close();

    const chats = parseNeo4jObject(result);

    return chats;
  });

  fastify.decorate('createUser', async function(username: string, password: string, email: string) {
    connect();
    const cqlQuery = await getQuery('CreateUser'); 

    const getUserCqlQuery = await getQuery('GetUser');
    const userResult = await driver.executeQuery(
      getUserCqlQuery,
      { username },
      { database: 'neo4j' }
    );

    // TODO: If user exists userResult.length > 0 then prevent creation

    if(userResult != null && userResult.records.length > 0) {
      console.log(`User ${username} already exists`);
      console.log(JSON.stringify(userResult));
      return false;
    }
    console.log(`cqlQuery: ${cqlQuery}`);
    await driver.executeQuery(
      cqlQuery,
      { username, password, email },
      { database: 'neo4j' }
    );
    // TODO: Check room, user and message all exist and validate

    await driver.close();

    return true;
  });

  fastify.decorate('authenticateUser', async function(username: string, password: string) {
    connect();
    const cqlQuery = await getQuery('AuthenticateUser');
    console.log(`cqlQuery: ${cqlQuery}`);
    const result = await driver.executeQuery(
      cqlQuery,
      { username, password },
      { database: 'neo4j' }
    );
    // TODO: Check room, user and message all exist and validate

    await driver.close();

    if (parseNeo4jObject(result).length > 0) {
      return true;
    }

    return false
  });


  fastify.decorate('resetPassword', async function(username: string, password: string, newPassword: string) {
    connect();
    const cqlQuery = await getQuery('UpdatePassword');
    console.log(`reset pw cqlQuery: ${cqlQuery}`);
    const result = await driver.executeQuery(
      cqlQuery,
      { username, password, newPassword },
      { database: 'neo4j' }
    );
    // TODO: Check room, user and message all exist and validate

    await driver.close();

    if (parseNeo4jObject(result).length > 0) {
      console.log(parseNeo4jObject(result));
      return true;
    }

    return false
  });


  fastify.decorate('deleteUser', async function(username: string, password: string, newPassword: string) {
    connect();
    const cqlQuery = await getQuery('DeleteUser');
    console.log(`delete user cqlQuery: ${cqlQuery}`);
    const result = await driver.executeQuery(
      cqlQuery,
      { username, password },
      { database: 'neo4j' }
    );
    // TODO: Check room, user and message all exist and validate

    await driver.close();

    if (parseNeo4jObject(result).length > 0) {
      return true;
    }

    return false;
  });
  

  fastify.decorate('runCypher', async function(cypher: string) {
    connect();
    const result = await driver.executeQuery(
      cypher,
      {},
      { database: 'neo4j' }
    );
    await driver.close();

    return { parsedResult: parseNeo4jObject(result), cypherResponse: result };
  });
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    sendChat(username: string, room: string, message: string): void;
    getChats(room: string, from?: string): unknown;
    createUser(username: string, password: string, email: string): Promise<boolean>;
    authenticateUser(username: string, password: string): Promise<boolean>;
    resetPassword(username: string, password: string, newPassword: string): Promise<boolean>;
    deleteUser(username: string, password: string): Promise<boolean>;

    runCypher(cypher: string): any;
  }
}
