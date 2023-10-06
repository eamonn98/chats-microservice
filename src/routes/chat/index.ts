import { FastifyPluginAsync } from "fastify"

interface IQuerystring {
  room: string;
}

interface IHeaders {
  
}


interface IReply {
  200: { chats: any };
}

interface IBody {
  cypher: string
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQuerystring,
    Headers: IHeaders,
    Reply: IReply
  }>('/', async (request, reply) => {
    const { room } = request.query
    reply.code(200).send({chats: await fastify.getChats(room)});
  });

  fastify.post<{Body: IBody}>('/', async (request, reply) => {
    const cypher = request.body.cypher;
    console.log(cypher);

    const res = await fastify.runCypher(cypher);

    reply.code(200).send({resp: res});
  });
}

    // const room = request.body['room'];
    // return fastify.getChats(room);
export default example;
