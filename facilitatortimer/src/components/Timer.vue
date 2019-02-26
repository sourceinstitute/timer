<template>
  <div>
    <div class="prg">
      <progress-bar :options="{
        text: { hideText: true, dynamicPosition: true },
        progress: { color: '#2dbd2d', backgroundColor: '#000' },
        layout: { height: 200, width: 200, type: 'line' }
        }" 
        :value = "percentage"
/>
      </div>
      <div class="timer">
        {{timeLeft | timer }}
      </div>
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
  components: {
  },
  data() {
    return {
      startTS: Date.now(),
      timerLength: 300,
      timeLeft: 300,
      percentage: 100,
      autostart: false
    }
  },
  computed: {
    endTS: function () {
      return this.startTS + this.timerLength * 1000;
    },
  },
  methods: {
    startTimer: function() {
      this.timer = setInterval(() => this.countdown(), 1000);
    },
    moreTime: function () {
      this.timerLength+=60;
    },
    countdown: function() {
      this.timeLeft = ((this.endTS - Date.now())/1000);

      if (this.timeLeft < 0) {
        this.percentage = 0;
        this.timeLeft = "Done";
        document.body.className = 'done'; 
      } else {
        var percentage = (Number(this.timerLength-this.timeLeft)/ Number(this.timerLength)*100).toFixed(0);
        this.percentage = percentage;
      }
    },
    requestedTime: function() {
      var time = window.location.pathname.slice(1);
      if (time === '') {
        this.autostart = false;
        this.timerLength=60;
      } else if (time.includes(":")) {
        this.autostart = true;
        var p = time.split(':'), s = 0, m = 1;
        while (p.length > 0) {
          s += m * parseInt(p.pop(), 10);
          m *= 60;
        }
        this.timerLength = s;
      } else if (!isNaN(time)) {
        this.autostart = true;
        this.timerLength = Number(time);
      }
      return this.timerLength;
    }
  },
  filters: {
    timer: function(value) {
      if (!isNaN(value)) {
        var sec_num = parseInt(value, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var ret;

        if ((minutes < 10 && hours > 0)) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        ret = seconds;
        ret = minutes+ ':' + ret;
        if (hours > 0 ) ret = hours + ':' + ret;
        
        return ret;
      } else {
        return value;
      }
    }
  },
  beforeMount() {
    this.startTimer();
    this.requestedTime();
    this.countdown();
  },
  mounted() {
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style>
.prg { float: right}
.done { background: #09ef34; }
.timer{font-size: 60vh; text-align: center;  height: 100%;}
</style>
