import { Server } from 'hapi'
import PetsPlugin from './plugins/pets'

const env = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 5000

const defaultPlugins = async (server) => {
  const plugins = [
    { plugin: require('inert') },
    { plugin: require('vision') },
    { plugin: require('blipp') },
    {
      plugin: require('good'),
      options: {
        ops: {
          interval: 5000,
        },
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{
                log: '*',
                response: '*',
                request: '*',
                error: '*',
              }],
            },
            {
              module: 'good-console',
              args: [{
                log: '*',
                response: '*',
                request: '*',
                error: '*',
              }],
            }, 'stdout'],
        },
      },
    },
    {
      plugin: require('hapi-swagger'),
      options: {
        cors: true,
        jsonEditor: true,
        documentationPath: '/',
        info: {
          title: 'Pets API',
          version: '1.0.0',
          description: 'A Pet API',
        },
      },
    },
  ]

  await server.register(plugins)
}

const customPlugins = async server => {
  await server.register([
    { plugin: PetsPlugin}
  ])
}


export default async () => {

  const options = {
    router: {
      isCaseSensitive: false,
    },
    routes: {
      cors: true,
    },
  }

  if(env !== 'testing') {
    options.port = port
  }

  const server = new Server(options)

  await defaultPlugins(server)
  await customPlugins(server)
  await server.initialize()


  if (env !== 'testing') {

  }

  return server
}
