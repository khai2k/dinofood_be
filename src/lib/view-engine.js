const Joi = require('@hapi/joi')
const path = require('path')
const moment = require('moment')
const nunjucks = require('nunjucks')
const { minify } = require('html-minifier')
const helpers = require('@/utils/helpers')

module.exports = function (server) {
  const config = global.CONFIG

  // expose admin menu
  const menu = {
    items: [
      {
        name: 'cms',
        type: 'header',
        title: 'CMS',
        position: 0
      },
      {
        name: 'manager',
        type: 'header',
        title: 'Manager',
        position: 10
      }
    ],
    schema: Joi.object({
      type: Joi.string().valid('header', 'item').default('item'),
      title: Joi.string().default('Item title'),
      name: Joi.string().default('Item name'),
      icon: Joi.string().default('far fa-circle'),
      path: Joi.string().default('#'),
      isTreeView: Joi.boolean().default(false),
      visible: Joi.boolean().default(true),
      parent: Joi.string(),
      after: Joi.string(),
      items: Joi.array().default([])
    }).unknown(true),
    async addItem (item) {
      const validItem = await this.schema.validateAsync(item)
      let _parent = this
      if (validItem.parent) {
        _parent = helpers
          .ensureArray(_parent.items)
          .find(({ name }) => name === validItem.parent)
        if (!_parent) {
          throw new Error(`Menu item ${validItem.parent} must register before ${validItem.name}`)
        }
      }

      _parent.items.push({
        ...validItem,
        position: _parent.items.length * 10
      })
    },
    getTreeClass (route, items) {
      if (!(items && items.length)) {
        return ''
      }

      const active = items.some(item => {
        return item.path === route.path
      })

      return active ? 'active' : ''
    },
    getItemClass (route, item) {
      return item.path === route.path ? 'active' : ''
    },
    getHeader (route, item) {
      return `<li class="header">${item.title}</li>`
    },
    getItem (route, item) {
      if (item.isTreeView) {
        return `<li class="treeview ${this.getTreeClass(route, item.items)}">
          <a href="${item.path}">
            <i class="${item.icon}"></i>
            <span>${item.title}</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>

          ${item.items && item.items.length ? `<ul class="treeview-menu">${this.render(route, item.items)}</ul>` : ''}
        </li>`
      }

      return `<li class="${this.getItemClass(route, item)}">
        <a href="${item.path}">
          <i class="${item.icon}"></i>
          ${item.title}
          </a>
        </li>`
    },
    getPosition (before, after, items, currentPos) {
      // after | item | before

      let afterPos
      let beforePos

      if (after) {
        const afterItem = items.find(({ name }) => name === after)
        if (afterItem) {
          afterPos = afterItem.position
        }
      }

      if (before) {
        const beforeItem = items.find(({ name }) => name === before)
        if (beforeItem) {
          beforePos = beforeItem.position
        }
      }

      if (beforePos !== undefined && afterPos !== undefined && afterPos >= beforePos) {
        throw new Error(`Item invalid position between: ${after} | item | ${before}`)
      }

      let position = currentPos
      if (afterPos === undefined) {
        afterPos = -1000
      }
      if (beforePos === undefined) {
        beforePos = 1000
      }

      while (position <= afterPos || position >= beforePos) {
        if (position <= afterPos) {
          position += 0.5
        } else if (position >= beforePos) {
          position -= 0.5
        }
      }

      return position
    },
    sortItems (items) {
      if (!items) {
        items = this.items
      }

      for (const index in items) {
        const item = items[index]

        if (item.before || item.after) {
          const newPosition = this.getPosition(item.before, item.after, items, item.position)
          if (newPosition !== item.position) {
            item.position = newPosition
            return this.sortItems(items)
          }
        }

        if (item.items && item.items.length) {
          this.sortItems(item.items)
        }
      }

      items = items.sort((a, b) => {
        if (a.position < b.position) {
          return -1
        }
        if (a.position > b.position) {
          return 1
        }

        // a must be equal to b
        return 0
      })
    },
    render (route, items) {
      if (!items) {
        items = this.items
      }

      return items.map((item, index) => {
        if (item.visible === false) {
          return ''
        }

        switch (item.type) {
          case 'header':
            return this.getHeader(route, item)
          case 'item':
            return this.getItem(route, item)
          default:
            return ''
        }
      }).join('\n').replace(/^\s+/gmi, '')
    }
  }

  global.menu = menu

  /* hook event add menu item with route config */
  server.events.on('route', route => {
    if (route.settings.plugins && route.settings.plugins.menu) {
      const routeMenu = route.settings.plugins.menu
      if (helpers.isArray(routeMenu)) {
        for (const item of routeMenu) {
          menu.addItem({ ...item, path: route.path })
        }
      } else {
        menu.addItem({ ...routeMenu, path: route.path })
      }
    }
  })

  /* hook event sort menu items with after, before */
  server.events.on('start', () => {
    menu.sortItems()
  })

  // custom view context
  server.ext('onPreResponse', (request, h) => {
    if (request.response.variety !== 'view') {
      return h.continue
    }

    const response = request.response

    if (!response.source.context) {
      response.source.context = {}
    }

    response.source.context.route = request.route
    response.source.context.timestamp = new Date().getTime()

    response.source.context.auth = (request.auth && request.auth.isAuthenticated && request.auth) || false
    response.source.context.query = request.query || {}
    response.source.context.params = request.params || {}
    response.source.context.payload = request.payload || {}

    response.source.context.isAuth = function (uid) {
      return request.auth && request.auth.credentials && String(request.auth.credentials.uid) === String(uid)
    }

    response.source.context.old = function (key, defaultVal = '') {
      return response.source.context.payload[key] ||
        response.source.context.query[key] ||
        response.source.context.params[key] ||
        defaultVal
    }

    return h.continue
  })

  // config view-engine
  server.views({
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)
          return context => {
            context.menu = menu
            context.helpers = helpers
            context.auth = context.auth || false
            context.old = context.old || function (key, defaultVal = '') {
              return defaultVal
            }

            const content = template.render(context)
            if (process.env.NODE_ENV === 'production') {
              const result = minify(content, {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true
              })

              return result
            }

            return content
          }
        },

        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure(options.path, {
            watch: false,
            tags: {
              blockStart: '{%',
              blockEnd: '%}',
              variableStart: '{{',
              variableEnd: '}}',
              commentStart: '{#',
              commentEnd: '#}'
            }
          })

          // TODO: All filter here
          options.compileOptions.environment.addFilter('dateFormat', (date, format = config.get('date.format'), timeZone = '') => {
            try {
              const tmpDate = String(timeZone).match(/utc/i) ? moment.utc(date) : new Date(date)
              if (date && String(tmpDate) !== 'Invalid Date') {
                return String(timeZone).match(/utc/i) ? moment.utc(date).format(format) : moment(date).format(format)
              }
            } catch (error) {}

            return date
          })
          options.compileOptions.environment.addFilter('toMinSec', time => {
            const total = Math.ceil(Number(time))
            const min = Math.floor(total / 60)
            const sec = total % 60

            return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)
          })

          return next()
        }
      }
    },
    path: path.join(__dirname, '..', 'views'),
    context: {
      config: global.CONFIG
    }
  })
}
