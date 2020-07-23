# vuex-map-purge

Convert Vuex map utils to computed / methods.

## Motivation

Vuex 4.0 fixes a problem that Generics had with the Store in the previous Vuex, making it possible to build a more type-safe system.

However, Vuex's mapXXX utility, which exists in Vuex, does not solve the type problem and hinders future type-safe coding.

As a result, we needed a tool to eliminate mapXXX from existing Vue.js projects as soon as possible.

## Installation

Install via Yarn / NPM.

```shell
$ yarn add -g vuex-map-purge # or npm install -g vuex-map-purge
```

## Usage

```shell
$ vuex-map-purge './**/*.vue' # all project .vue files
$ vuex-map-purge ./path/to/file.vue # only single .vue file
```

## Licence

MIT
