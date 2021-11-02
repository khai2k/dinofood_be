const axios = require('axios')
const mongoose = require('mongoose')
const helpers = require('@/utils/helpers')

/**
 * Model
 */
const Dish = mongoose.model('Dish')
const Store = mongoose.model('Store')
const DishType = mongoose.model('DishType')
const Category = mongoose.model('Category')

/**
 * All now.vn id_type param alway equal 2 if require
 */
const idType = 2

/**
 * Create API instance with headers options
 */
const axiosInstance = axios.create({
  baseURL: 'https://gappapi.deliverynow.vn/api',
  headers: {
    'x-foody-access-token': '',
    'x-foody-api-version': '1',
    'x-foody-app-type': '1004',
    'x-foody-client-id': '',
    'x-foody-client-language': 'vi',
    'x-foody-client-type': '1',
    'x-foody-client-version': '3.0.0'
  }
})

/**
 * Fetch store id by web view URL
 * @param {String} url store url from now.vn
 * @return {Promise<Object>}
 */
const fetchFomURL = async (url) => {
  const replaceRegex = /^https:\/\/www\.now\.vn\//i
  if (!url.match(replaceRegex)) {
    throw new Error('url must start with: https://www.now.vn/')
  }

  const nowURL = new URL(url)

  const { data } = await axiosInstance.get(`/delivery/get_from_url?url=${nowURL.pathname.substr(1, 1000)}`)

  if (data.result !== 'success') {
    throw new Error(`now.vn|fetchFomURL failed: ${data.result}`)
  }

  return data.reply
}

/**
 * Match categories name with DB
 * @param {String[]} categories
 * @return {Promise<ObjectId[]>}
 */
const matchCategories = async categories => {
  const result = []

  for (const name of helpers.ensureArray(categories)) {
    let category = await Category
      .findOne({ name })
      .select('_id')
      .lean()
    if (!category) {
      category = await Category.create({
        name,
        slug: await Category.generateSlug(name)
      })
    }

    result.push(category._id)
  }

  return result
}

/**
 * Fetch store's general information
 * @param {Number} id id is delivery_id in response data of fetchFomURL
 * @return {Promise<Store>}
 */
const fetchStoreGeneral = async (id) => {
  const { data } = await axiosInstance.get(`/delivery/get_detail?id_type=${idType}&request_id=${id}`)

  if (data.result !== 'success') {
    throw new Error(`now.vn|fetchStoreGeneral failed: ${data.result}`)
  }

  const information = data.reply.delivery_detail
  let store = await Store.findOne({
    provider: 'now',
    url: information.url
  })

  if (!store) {
    store = await Store.create({
      idInc: id,
      name: information.name,
      slug: await Store.generateSlug(information.restaurant_url),
      url: information.url,
      photos: helpers.ensureArray(information.photos),
      address: information.address,
      provider: 'now',
      tags: helpers.ensureArray(information.cuisines),
      categories: await matchCategories(information.categories),
      location: {
        type: 'Point',
        coordinates: [information.longitude || 0, information.latitude || 0]
      },
      rating: {
        avg: information.rating.avg,
        count: information.rating.total_review
      }
    })
  } else {
    store.idInc = id
    store.name = information.name
    store.photos = helpers.ensureArray(information.photos)
    store.address = information.address
    store.tags = helpers.ensureArray(information.cuisines)
    store.categories = await matchCategories(information.categories)
    store.location = {
      type: 'Point',
      coordinates: [information.longitude || 0, information.latitude || 0]
    }
    store.rating = {
      avg: information.rating.avg,
      count: information.rating.total_review
    }
    await store.save()
  }

  return store.toObject()
}

/**
 * Match dishTypes idInc with DB
 * @param {Object[]} dishTypes
 * @return {Promise<DishType[]>}
 */
const matchDishType = async dishTypes => {
  const result = []

  for (const { idInc, name, ...fields } of helpers.ensureArray(dishTypes)) {
    let dishType = await DishType.findOne({ idInc })
    if (!dishType) {
      dishType = await DishType.create({
        idInc,
        name
      })
    }

    result.push({
      ...dishType.toObject(),
      ...fields
    })
  }

  return result
}

/**
 * Format now dish options to Dish schema options
 * @param {Object[]} options
 * @return {Object[]}
 */
const formatDishOptions = options => {
  return helpers
    .ensureArray(options)
    .map(option => ({
      name: option.name,
      isRequired: Boolean(option.mandatory),
      items: helpers
        .ensureArray(option.option_items && option.option_items.items)
        .map(item => ({
          name: item.name,
          price: Number(item.price && item.price.value) || 0,
          isDefault: Boolean(item.is_default)
        }))
    }))
}

/**
 * Fetch store's menu information
 * @param {Store} store
 * @return {Promise<Dish[]>}
 */
const fetchStoreMenu = async (store) => {
  const { data } = await axiosInstance.get(`/dish/get_delivery_dishes?id_type=${idType}&request_id=${store.idInc}`)

  if (data.result !== 'success') {
    throw new Error(`now.vn|fetchStoreMenu failed: ${data.result}`)
  }

  const dishTypes = await matchDishType(
    helpers
      .ensureArray(data.reply.menu_infos)
      .map(dishType => ({
        idInc: dishType.dish_type_id,
        name: dishType.dish_type_name,
        dishes: helpers.ensureArray(dishType.dishes)
      }))
  )

  const dishes = []
  for (const dishType of dishTypes) {
    for (const dish of dishType.dishes) {
      let doc = await Dish.findOne({ idInc: dish.id })
      if (!doc) {
        doc = await Dish.create({
          idInc: dish.id,
          name: dish.name,
          type: dishType._id,
          price: dish.price.value,
          discountPrice: (dish.discount_price && dish.discount_price.value) || 0,
          store: store._id,
          photos: helpers.ensureArray(dish.photos),
          description: dish.description,
          options: formatDishOptions(dish.options)
        })
      } else {
        doc.name = dish.name
        doc.type = dishType._id
        doc.price = dish.price.value
        doc.discountPrice = (dish.discount_price && dish.discount_price.value) || 0
        doc.store = store._id
        doc.photos = helpers.ensureArray(dish.photos)
        doc.description = dish.description
        doc.options = formatDishOptions(dish.options)
        await doc.save()
      }

      dishes.push(
        doc.toObject()
      )
    }
  }

  return dishes
}

module.exports = {
  axiosInstance,
  fetchFomURL,
  fetchStoreGeneral,
  fetchStoreMenu
}
