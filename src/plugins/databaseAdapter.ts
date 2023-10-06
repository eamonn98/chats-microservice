import fp from 'fastify-plugin'
import neo4j from 'neo4j-driver';

export interface DatabaseAdapterPluginOptions {
    // Specify DatabaseAdapter plugin options here
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

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<DatabaseAdapterPluginOptions>(async (fastify, opts) => {
    connect();
    fastify.decorate('sendChat', async function (user: string, room: string, message: string): Promise<void> {
        const cqlQuery = 'MERGE (r:Room) { name: "$room"}) \
            CREATE (m:Chat {message: $message, created: datetime()}) \
            \
            MATCH (u:User {username: $user})\
            CREATE (m)-[r1:CONTAINS]->(m) \
            CREATE (m)[r2:SENT_BY]->(u) \
            \
        ';
        await driver.executeQuery(
            cqlQuery,
            { user, room, message },
            { database: 'neo4j' }
        );

        await driver.close();
    })

    fastify.decorate('getChats', async function (room: string) {
        connect();
        const cqlQuery = 'MATCH (r:Room) {name: $room})-[:CONTAINS]->(m:Message) RETURN m ';
        const result = await driver.executeQuery(
            cqlQuery,
            { room },
            { database: 'neo4j' }
        );
        await driver.close();

        return result;
    });

    fastify.decorate('createUser', function (user: string, password: string, email: string) {
        return false
    });

    fastify.decorate('authenticateUser', function (user: string, password: string) {
        return false;
    });
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
    export interface FastifyInstance {
        sendChat(user: string, room: string, message: string): void;
        getChats(room: string): unknown;
        createUser(user: string, password: string, email: string): boolean;
        authenticateUser(user: string, password: string): boolean;
    }
}
