import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import swagger from '@fastify/swagger';
import cors from '@fastify/cors';

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })

  await fastify.register(cors, { 
    origin: '*'
  })

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Chat API',
        description: 'A set of REST API endpoints for a chat application',
        version: '0.0.0'
      },
      schemes: ['https'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  });

};

export default app;
export { app, options }
