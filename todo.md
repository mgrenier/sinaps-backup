#### Release Demo
- TODO sinaps.section : Page
- TODO sinaps.core : Translation files
- TODO sinaps.section : Field entry picker
- TODO sinaps.asset : Assets source
- TODO sinaps.asset : Assets
- TODO sinaps.asset : Assets transform
- TODO sinaps.asset : Field asset picker
- TODO sinaps.user : Users
- TODO sinaps.user : Permissions
- TODO sinaps.core : Plugin's options/configurations
- TODO sinaps.section : Versioning

- TODO validation & feedback
- IDEA demo site + examples/tutos

- IDEA sinaps.core : PM2 cluster
- IDEA sinaps.core : IPC cluster
- IDEA sinaps.core : HTTP/2

- TODO rewrite sinaps + sinaps.core as single module + plugins as their own modules
  ```
  var sinaps = require('sinaps');
  sinaps.configure({...}).then(function (sinaps) {
    sinaps.addPlugin(require('sinaps-admin'));
    sinaps.addPlugin(require('sinaps-admin-dashboard'));
    sinaps.addPlugin(require('sinaps-admin-developer'));
    sinaps.addPlugin(require('sinaps-section'));
    sinaps.start();
  })
  ```

#### Read later
- IDEA https://nodejs.org/api/domain.html
- IDEA https://www.npmjs.com/package/node-ipc
- IDEA https://mozilla.github.io/nunjucks/templating.html#asynceach
