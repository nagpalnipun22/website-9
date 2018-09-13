const REPOSITORY_URL = 'https://plugins.dita-ot.org/_all.json'

let plugins = null

document.addEventListener('DOMContentLoaded', event => {
  fetch(REPOSITORY_URL)
    .then(response => response.json())
    .then(init)
    .catch(err => {
      console.error('Failed to fetch plugins: ' + err)
    })
})

function init(json) {
  plugins = json
  window.onpopstate = event => {
    show(location.hash)
  }
  show(location.hash)
}

function show(hash) {
  let content = null
  if (!!hash) {
    const [name, version] = hash.substr(1).split('/')
    const pluginVersions = plugins[name].slice()
    pluginVersions.sort(compareVersion)
    content = details(pluginVersions, version) || notFound(name, version)
  } else {
    content = list(plugins)
  }
  const wrapper = document.getElementById('plugins')
  clear(wrapper)
  append(wrapper, content)
}

function notFound(name, version) {
  return elem(
    'p',
    !!version ? `Plugin ${name} version ${version} not found.` : `Plugin ${name} not found.`
  )
}

function list(json) {
  return elem(
    'ul',
    Object.values(json)
      .filter(plugin => !!plugin)
      .sort((a, b) => a[0].name.localeCompare(b[0].name))
      .map(plugin => {
        const first = plugin[0]
        return elem('li', [
          elem('a', { href: `#${first.name}`, style: 'font-weight:bold' }, first.name),
          elem('p', { class: 'small' }, first.description)
        ])
      })
  )
}

function details(versions, version) {
  const first = !!version ? versions.find(plugin => plugin.vers === version) : versions[0]
  if (!first) {
    return null
  }

  const div = document.createElement('div')

  div.appendChild(elem('h2', [`${first.name}`, elem('small', ` ${first.vers}`)]))

  if (!!first.description) {
    append(div, elem('p', { class: 'shortdesc' }, first.description))
  }
  if (!!first.keywords && first.keywords.length !== 0) {
    append(div, [elem('h3', 'Keywords'), elem('p', first.keywords.join(', '))])
  }
  if (!!first.homepage) {
    append(div, [
      elem('h3', 'Homepage'),
      elem('p', elem('a', { href: first.homepage }, getDomain(first.homepage)))
    ])
  }
  append(div, [
    elem('h3', 'Install'),
    elem('p', { class: 'small' }, 'DITA-OT 3.1 and newer'),
    elem('pre', `dita --install ${first.name}`),
    elem('p', { class: 'small' }, 'DITA-OT 3.0 and older'),
    elem('pre', `dita --install ${first.url}`)
  ])

  const deps = first.deps
  deps.sort((a, b) => a[0].name.localeCompare(b[0].name))
  append(div, [
    elem('h3', 'Dependencies'),
    elem(
      'ul',
      deps
        .filter(dep => dep.name === 'org.dita.base')
        .map(dep => elem('li', `DITA-OT ${dep.req || ''}`))
    ),
    elem(
      'ul',
      deps
        .filter(dep => dep.name !== 'org.dita.base')
        .map(dep => elem('li', `${dep.name} ${dep.req || ''}`))
    )
  ])

  append(div, [
    elem('h3', 'Versions'),
    elem(
      'ul',
      versions.map(version =>
        elem('li', elem('a', { href: `#${first.name}/${version.vers}` }, version.vers))
      )
    )
  ])

  return div
}

function elem() {
  const name = arguments[0]
  const attrs = arguments.length === 3 ? arguments[1] : {}
  const content = arguments.length === 3 ? arguments[2] : arguments[1]
  const installBlock = document.createElement(name)
  Object.keys(attrs).forEach(key => {
    installBlock.setAttribute(key, attrs[key])
  })
  append(installBlock, content)
  return installBlock
}

function append(parent, content) {
  if (content === undefined || content === null) {
    return
  }
  switch (typeof content) {
    case 'string':
      parent.appendChild(document.createTextNode(content))
      break
    case 'object':
      if (Array.isArray(content)) {
        content.forEach(c => {
          append(parent, c)
        })
        break
      }
    default:
      parent.appendChild(content)
  }
}

function getDomain(homepage) {
  return homepage.replace(/^\w+:\/\/([^\/]+?)(\/.*)?$/, '$1')
}

function clear(myNode) {
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild)
  }
}

function compareVersion(a, b) {
  function parse(v) {
    return v.split('.').map(v => Number.parseInt(v))
  }
  function compare(a = 0, b = 0) {
    if (a === b) {
      return 0
    } else if (a < b) {
      return 1
    } else {
      return -1
    }
  }
  function zip(as, bs) {
    return as.map(function(e, i) {
      return [e, bs[i]]
    })
  }

  try {
    const as = parse(a)
    const bs = parse(b)
    return zip(as, bs)
      .map(pair => compare(pair[0], pair[1]))
      .reduce((acc, curr) => (acc !== 0 ? acc : curr), 0)
  } catch (e) {
    return 0
  }
}