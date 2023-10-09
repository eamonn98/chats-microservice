import { FastifyPluginAsync } from "fastify"


interface RegisterBody {
  username: string,
  password: string,
  email: string
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{Body: RegisterBody}>('/', async (request, reply) => {
    const {username, password, email} = request.body;
    const res = await fastify.createUser(username, password, email);

    if(res) {
      reply.code(200).send({resp: res});
    } else {
      reply.code(500);
    }

  });
}

    // const room = request.body['room'];
    // return fastify.getChats(room);
export default example;
