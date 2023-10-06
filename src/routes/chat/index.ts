import { FastifyPluginAsync } from "fastify"

interface IQuerystring {
    room: string;
  }

  interface IHeaders {
    
  }

  
  interface IReply {
    200: { chats: any };
  }

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQuerystring,
    Headers: IHeaders,
    Reply: IReply
  }>('/', async (request, reply) => {
    const { room } = request.query
    reply.code(200).send({chats: fastify.getChats(room)});
  })
}

    // const room = request.body['room'];
    // return fastify.getChats(room);
export default example;
