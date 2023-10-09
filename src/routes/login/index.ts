import { FastifyPluginAsync } from "fastify"

interface LoginBody {
  username: string,
  password: string
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{Body: LoginBody}>('/', async (request, reply) => {
    const {username, password} = request.body;
    const res = await fastify.authenticateUser(username, password);

    if(res) {
      reply.code(200).send({resp: res});
    } else {
      reply.code(401);
    }
  });
}

    // const room = request.body['room'];
    // return fastify.getChats(room);
export default example;
