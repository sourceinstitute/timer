<template>
  <div id="app">
    <Timer></Timer>
  </div>
</template>

<script>
import Timer from './components/Timer'

export default {
  name: 'app',
  components: {
    Timer
  }
}
</script>

<style>
#app {
  @import url('https://fonts.googleapis.com/css?family=Oxygen|PT+Mono');
  font-family: "Oxygen", Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
}
body {
  margin: 0; background: #fff;
}
</style>
