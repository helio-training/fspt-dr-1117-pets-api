import Monk from 'monk'
import Boom from 'boom'
import Joi from 'joi'

const uri = process.env.MONGO_URI
if (!uri)
  throw new Error('URI not defined')

const db = Monk(uri)
const pets = db.get('pets')

const findPetById = async id => {
  const pet = await pets.findOne(id)
  if (!pet)
    throw Boom.notFound('Pet not found', id)
  return pet
}


const getAll = {
  method: 'GET',
  path: '/pets',
  options: {
    tags: ['api'],
  },
  handler: async (request, h) => {

    return await pets.find()
  },
}
const getOne = {
  method: 'GET',
  path: '/pets/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    const { id } = request.params
    return await findPetById(id)
  },
}
const post = {
  method: 'POST',
  path: '/pets',
  options: {
    validate: {
      payload: {
        name: Joi.string().required().trim().label('Name'),
        type: Joi.string().required().trim().label('Type').default('Dog'),
        isActive: Joi.boolean().default(true),
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    const pet = request.payload
    return await pets.insert(pet)
  },
}
const put = {
  method: 'PUT',
  path: '/pets/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      payload: {
        name: Joi.string().trim().label('Name'),
        type: Joi.string().trim().label('Type').default('Dog'),
        isActive: Joi.boolean().default(true),
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    const { id } = request.params
    const updatedPet = request.payload

    const pet = await pets.findOneAndUpdate(id, updatedPet)
    if (!pet)
      return Boom.notFound('Pet not found', id)

    return pet
  },
}
const remove = {
  method: 'DELETE',
  path: '/pets/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    const { id } = request.params
    const result = await pets.findOneAndDelete(id)
    if(!result)
      return Boom.notFound('Pet not found', id)
    return {}
  },
}


export default {
  name: 'pets',
  version: '1.0.0',
  register(server, options) {

    server.route([getAll, getOne, post, put, remove])
  },
}
