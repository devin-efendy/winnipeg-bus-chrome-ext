# `Winnipeg Bus Chrome Web Extension`

A Chrome Extension that displays nearby transit/bus stops and schedules across Winnipeg. Users also able to search for nearby bus stops and the busses that go through each stop including schedules for each bus. There will be an indicator whether the bus going to early or late.

This is the link for the Chrome Web Store: [Winnipeg Bus](https://chrome.google.com/webstore/detail/winnipeg-bus/cbgjpmfdjnogcgkpjcpnihmocbhpbgpo?hl=en)

## **Tech Stack**

This project is created using React with [Material-UI](https://material-ui.com/), a popular React UI framework. The data of transit/bus stops and schedule, is acquired from [Winnipeg Transit's Open Data Web Service API](https://api.winnipegtransit.com/home/api/v3).

## **How to run locally**

Make sure that you have `npm` or `yarn` installed

[Install NPM](https://nodejs.org/en/)

[Install Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

Then, you need to clone the project

```shell
git clone https://github.com/devin-efendy/winnipeg-bus-chrome-ext.git
```

After that, change to the working directory and run `npm install` or `yarn install` depending on which package manager
that you prefer. This will install all the dependencies for the project.

```shell
cd winnipeg-bus-chrome-ext

yarn install
```

When you finished installing all the dependencies, you can start running the application
```shell
yarn start
```

Now the application is up on `localhost` port `3000`