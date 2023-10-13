import { FastifyPluginAsync } from "fastify"


interface RequestBody {
  username: string,
  password: string,
  newPassword: string
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{Body: RequestBody}>('/', async (request, reply) => {
    const {username, password, newPassword} = request.body;
    const res = await fastify.resetPassword(username, password, newPassword);

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
