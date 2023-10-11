import { FastifyPluginAsync } from "fastify"

interface IBody {
  cypher: string
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<{Body: IBody}>('/', async function (request, reply) {
    return await fastify.runCypher(request.body.cypher);
  })
}

export default example;
