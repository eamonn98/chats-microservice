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
  user: string,
  room: string,
  message: string
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
    const {user, room, message} = request.body;
    const res = await fastify.sendChat(user, room, message);

    reply.code(200).send({resp: res});
  });
}

    // const room = request.body['room'];
    // return fastify.getChats(room);
export default example;
