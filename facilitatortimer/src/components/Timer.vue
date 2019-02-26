<template>
  <div>
    <vue-headful :title="timeLeft | timer" />
    <fullscreen ref="fullscreen" @change="fullscreenChange">
      <div id="prg">
        <div class="bar" v-bind:style="{ width: percentage + '%' }"></div>
      </div>
      <div id="timer">
        <span class="timeleft">{{timeLeft | timer }}</span>
      </div>
      <div id="controls">
        <button v-shortkey.once="['1']" @shortkey="moreTime()" @click="moreTime">+1</button>
        <button v-shortkey="['f']" @shortkey="togglefs()" @click="togglefs">fs</button>
        <button v-shortkey="['r']" @shortkey="restart()" @click="restart">r</button>
        <tooltip v-shortkey.once="['2']" @shortkey="moreTime(2)"></tooltip>
        <tooltip v-shortkey.once="['3']" @shortkey="moreTime(3)"></tooltip>
        <tooltip v-shortkey.once="['4']" @shortkey="moreTime(4)"></tooltip>
        <tooltip v-shortkey.once="['5']" @shortkey="moreTime(5)"></tooltip>
        <tooltip v-shortkey.once="['6']" @shortkey="moreTime(6)"></tooltip>
        <tooltip v-shortkey.once="['7']" @shortkey="moreTime(7)"></tooltip>
        <tooltip v-shortkey.once="['8']" @shortkey="moreTime(8)"></tooltip>
        <tooltip v-shortkey.once="['9']" @shortkey="moreTime(9)"></tooltip>
        <tooltip v-shortkey.once="['space']" @shortkey="togglerunning()"></tooltip>
      </div>
      <div id="footer">
      Made by <a href="http://source.institute">Source</a>
      </div>
    </fullscreen>
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
      startTS: Date.now() ,
      timerLength: 300,
      timeLeft: 300,
      timeElapsedSaved: 0,
      percentage: 100,
      autostart: false,
      running: false,
      fullscreen: false
    }
  },
  computed: {
    endTS: function () {
      return this.startTS + this.timerLength * 1000 ;
    },
    style () {
      return "width: 50%";
    }
  },
  methods: {
    startTimer: function() {
      this.timer = setInterval(() => this.countdown(), 500);
      this.running = true;
    },
    moreTime: function (number=1) {
      if (this.running) {
        this.timerLength+=(number*60);
      }
    },
    countdown: function() {
      if (this.running) {
        this.timeLeft = ((this.endTS - Date.now())/1000);

        if (this.timeLeft < 0) {
            this.percentage = 100;
            this.timeLeft = "Done";
            document.body.className = 'done'; 
            var bell = new Audio("/sounds/bell.mp3");
            bell.play();
            this.running = false;
        } else {
          var percentage = (Number(this.timerLength-this.timeLeft)/ Number(this.timerLength)*100).toFixed(2);
          this.percentage = percentage;
        }
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
    },
    togglefs () {
      this.$fullscreen.toggle(document.body, {background: "#fff"});
    },
    togglerunning () {
      if (this.running) {
        this.running = false;
        this.timeElapsedSaved = this.timerLength - this.timeLeft;
      } else {
        this.running = true;
        this.startTS = Date.now() - this.timeElapsedSaved*1000;
      }
    },
    fullscreenChange (fullscreen) {
      this.fullscreen = fullscreen
    },
    restart () {
      this.startTS = Date.now() ;
      this.timeLeft = this.timerLength;
      this.running = true;
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
#controls { position: fixed; right: 10px; top: 10px; z-index: 20}
#prg { position: absolute; width: 100%; height: 100%; z-index: 0;}
#timer{position: absolute; width: 100%; height: 100%; z-index: 10; font-size: 25vw; text-align: center; vertical-align: middle;}
#timer span {    position: fixed; left: 0; top: 50%; width: 100%; transform: translateY(-50%);}
#footer {position: absolute; bottom: 10px; left: 10px; right: 10px; height: 4vh; font-size: 3vh; text-align: center; z-index: 20;}
.bar { height: 100%; float: left; background: #47C27C;     -webkit-transition: 1s ; -moz-transition: 1s ; -o-transition: 1s ; transition: 1s ;}
body.done { background: #47C27C; }
</style>
