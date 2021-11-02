module.exports = [
  {
    method: 'GET',
    path: '/403',
    handler: (request, h) => {
      return h.view('errors/403')
    },
    options: {
      auth: { mode: 'try' }
    }
  },
  {
    method: 'GET',
    path: '/404',
    handler: (request, h) => {
      return h.view('errors/404')
    },
    options: {
      auth: { mode: 'try' }
    }
  },
  {
    method: 'GET',
    path: '/500',
    handler: (request, h) => {
      return h.view('errors/500')
    },
    options: {
      auth: { mode: 'try' }
    }
  }
]
