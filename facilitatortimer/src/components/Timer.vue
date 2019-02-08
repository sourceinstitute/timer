<template>
  <div>
    <span class="timer">
      {{timeLeft}}
    </span>
    <!-- <button @click="startTimer">Start Timer</button> -->
    <button @click="moreTime">+1</button>
  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: {
    time: Number
  },
  data() {
    return {
      startTS: Date.now(),
      timerLength: 300,
      timeLeft: 300
    }
  },
  computed: {
    endTS: function () {
      return this.startTS + this.timerLength * 1000;
    }
  },
  methods: {
    startTimer: function() {
      this.timer = setInterval(() => this.countdown(), 1000);
    },
    moreTime: function () {
      this.totalLength+=60
    },
    countdown: function() {
      this.timeLeft = ((this.endTS - Date.now())/1000).toFixed(0);//+this.timerLength
    }
  },
  mounted() {
    this.startTimer();
  },
}
</script>

<style>
.timer{font-size:10rem}
</style>