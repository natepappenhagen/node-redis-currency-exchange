<h1 align="center"> cache-it <img src="https://img.icons8.com/fluency/48/000000/egg-basket.png"/></hi>
<div align="center">
<img height="60%" width="60%" src="https://user-images.githubusercontent.com/26561931/140090733-dc18d2e1-cd1f-4362-9b7f-a9a510c2ef59.png"/>
</div>

### Stack:

- backend api is built is NodeJS
  - caching on the back end is done with redis
- front end client is built with ReactJS
  - caching on the front end is done with react-query
- docker & docker-compose stitch all the builds and run all apps in unison.

<div align="center">
<a title="NodeJS" href="httpshttps://nodejs.org/en/"><img src="https://img.icons8.com/color/48/000000/docker.png"/></a>
<a title="Redis" href="https://redis.io/"><img src="https://img.icons8.com/color/48/000000/redis.png"/></a>
<a title="Docker & docker-compose" href="https://www.docker.com/"><img src="https://img.icons8.com/color/48/000000/nodejs.png"/></a>
<a title="React" href="https://reactjs.org/"><img src="https://img.icons8.com/ultraviolet/40/000000/react--v2.png"/></a>
<a title="Material ui" href="https://mui.com/getting-started/usage/"><img src="https://img.icons8.com/color/48/000000/material-ui.png"/></a>
<a title="React query" href="https://react-query.tanstack.com/"><img height="20%" width="25%" src="https://react-query.tanstack.com/_next/static/images/logo-7a7896631260eebffcb031765854375b.svg"/></a>
</div>

### Run all services ( recommended )

- make sure docker is installed on your machine

```
docker-compose up
```

- if any changes are made to the files, be sure to run `docker-compose build` to rebuild the project.

This will :

- 🚀 launch a redis instance on port `6379`
- 🚀 launch the API server.js on port `5000`
- 🚀 launch the ui react app on port `3000`

### Launch api, redis, and ui projects independently

- Maybe you don't want to use docker-compose.
  - must run each service independently on localhost.

##### redis

    docker run -d --name redis-cache -p 127.0.0.1:6379:6379 redis

##### nodejs api ( from the `./api` folder root

    npm i && npm run start

##### reactjs client ui ( from the `./ui` folder root

    npm i && npm run start

##### Next steps `() => {}`

**front end**:

- remove extra dependencies and leverage the Intl.numberFormat that vanilla JS has.
  - [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- use the userLocale to shape the resulting currencies in formats that make sense for the users locale.
- add translation files for text to make evoloving into other languages simple.
- add commas to the output text fields.
- add 'reset' button.
- add tests
- consider replacing the two useEffects with an Observable stream that 
  could reduce unintended side effects from the useEffects.
- package up the front end into a standalone component that could be imported and consumed.

**back end**:

- package up the back end and deploy on AWS lambda for easy consumption.
- have fallback API providers in case the existing provider doesn't give us what we want
- actually develop models/types for the back end so that we can service a uniform shape to return
  that is agnostic of the provider and easy to evolve over time.
