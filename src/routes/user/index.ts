import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

const createUserBodySchema {
  type: 'object',
    properties: {
      username: {type: 'string'},
      password: {type: 'string'},
      email: {type: 'string'}
} as const;

const deleteUserBodySchema {
  type: 'object',
    properties: {
      username: {type: 'string'},
      password: {type: 'string'}
    }
} as const;

// interface CreateUserBody {
//   username: string,
//   password: string,
//   email: string
// }

type CreateUserBody = FromSchema(<typeof createUserBodySchema);
type DeleteUserBody = FromSchema(<typeof deleteUserBodySchema);


// interface DeleteUserBody {
//   username: string,
//   password: string
// }

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{Body: CreateUserBody}>('/', async (request, reply) => {
    const {username, password, email} = request.body;
    const res = await fastify.createUser(username, password, email);

    if(res) {
      reply.code(200).send({resp: res});
    } else {
      reply.code(500);
    }

  });

  fastify.delete<{Body: DeleteUserBody}>('/', async (request, reply) => {
    const {username, password} = request.body;
    const res = await fastify.deleteUser(username, password);

    if(res) {
      reply.code(200).send({resp: res});
    } else {
      reply.code(500);
    }

  });
}

export default example;
