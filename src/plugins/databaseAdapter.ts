import fp from 'fastify-plugin'
import neo4j from 'neo4j-driver';

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
  
  fastify.decorate('sendChat', async function(user: string, room: string, message: string): Promise<void> {
    connect();
    const cqlQuery = `
    MERGE (r:Room { name: $room});

    MATCH (r:Room {name: $room})
    MATCH (u:User {username: $username})
    CREATE (r)-[r1:CONTAINS]->(m:Chat {message: $message, created: datetime()})-[r2:SENT_BY]->(u);
    `;
    console.log(`cqlQuery: ${cqlQuery}`);
    await driver.executeQuery(
      cqlQuery,
      { user, room, message },
      { database: 'neo4j' }
    );

    await driver.close();
  })

  fastify.decorate('getChats', async function(room: string) {
    connect();
    const cqlQuery = 'MATCH (r:Room {name: $room})-[c:CONTAINS]->(m:Chat)-[s:SENT_BY]->(u) RETURN m.message AS message, apoc.date.toISO8601(m.createdAt.epochMillis, "ms") AS createdAt, u.username AS username;';
    const result = await driver.executeQuery(
      cqlQuery,
      { room },
      { database: 'neo4j' }
    );
    await driver.close();

    const chats = parseNeo4jObject(result);

    return chats;
  });

  fastify.decorate('createUser', function(user: string, password: string, email: string) {
    return false
  });

  fastify.decorate('authenticateUser', function(user: string, password: string) {
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
    sendChat(user: string, room: string, message: string): void;
    getChats(room: string): unknown;
    createUser(user: string, password: string, email: string): boolean;
    authenticateUser(user: string, password: string): boolean;

    runCypher(cypher: string): any;
  }
}
