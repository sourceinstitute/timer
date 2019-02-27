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
        <button v-shortkey.once="['1']" @shortkey="moreTime(60)" @click="moreTime(60)">1+</button>
        <button v-shortkey="['f']" @shortkey="togglefs()" @click="togglefs">f</button>
        <button v-shortkey="['h']" @shortkey="showhelp()" @click="showhelp">?</button>
        <tooltip v-shortkey.once="['2']" @shortkey="moreTime(120)"></tooltip>
        <tooltip v-shortkey.once="['3']" @shortkey="moreTime(180)"></tooltip>
        <tooltip v-shortkey.once="['4']" @shortkey="moreTime(240)"></tooltip>
        <tooltip v-shortkey.once="['5']" @shortkey="moreTime(300)"></tooltip>
        <tooltip v-shortkey.once="['6']" @shortkey="moreTime(360)"></tooltip>
        <tooltip v-shortkey.once="['7']" @shortkey="moreTime(420)"></tooltip>
        <tooltip v-shortkey.once="['8']" @shortkey="moreTime(480)"></tooltip>
        <tooltip v-shortkey.once="['9']" @shortkey="moreTime(520)"></tooltip>
        <tooltip v-shortkey.once="['0']" @shortkey="moreTime(600)"></tooltip>
        <tooltip v-shortkey.once="['space']" @shortkey="togglerunning()"></tooltip>
        <tooltip v-shortkey.once="['r']" @shortkey="restart()" @click="restart"></tooltip>
        <tooltip v-shortkey.once="['t']" @shortkey="moreTime(10)" @click="moreTime(10)"></tooltip>
      </div>
      <div id="footer">
        Made for facilitators by <a href="http://source.institute">Source</a>. It's work-in-progress, so all <a href="mailto:salim@source.institute">feedback welcome</a>.
      </div>
      <modal name="help" height="auto">
        <div id="help">
          <h3>Help</h3>
          <p>Press <strong>space</strong> to pause/unpause. <strong>R</strong> restarts the time. <strong>F</strong> toggles fullscreen.</p>
          While the timer's running, <strong>1-9</strong> adds bonus time (in minutes). <strong>0</strong> adds 10 minutes. <strong>T</strong> adds 10 seconds. <br/>
          <p>You can set the time by adding the length of the timer to the address.  For example, <strong>sourcetimer.com/30</strong> for 30 seconds.  You can also use MM:SS or HH:MM:SS. <strong>sourcetimer.com/1:40</strong> for 1 minute 40 seconds or <strong>sourcetimer.com/2:30:00</strong> for 2 and half hours.</p>
        </div>
      </modal>
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
      startTS: Date.now(),
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
      return this.startTS + this.timerLength * 1000;
    }
  },
  methods: {
    startTimer: function() {
      this.timer = setInterval(() => this.countdown(), 500);
      this.running = true;
      this.$matomo.trackEvent('timer', 'start');
    },
    moreTime: function (number=60) {
      if (this.running) {
        this.timerLength+=(number);
      }
    },
    countdown: function() {
      if (this.running) {
        this.timeLeft = ((this.endTS - Date.now())/1000);

        if (this.timeLeft < 0) {
            this.percentage = 100;
            this.timeLeft = "Done";
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
        this.$matomo.trackEvent('timer', 'pause');
      } else {
        this.running = true;
        this.startTS = Date.now() - this.timeElapsedSaved*1000 ;
        this.$matomo.trackEvent('timer', 'unpause');
      }
    },
    fullscreenChange (fullscreen) {
      this.fullscreen = fullscreen
    },
    restart () {
      this.startTS = Date.now() ;
      //this.timeLeft = this.timerLength;
      this.requestedTime();
      this.running = true;
    },
    showhelp () {
      this.$modal.toggle('help');
    }

  },
  filters: {
    timer: function(value) {
      if (!isNaN(value)) {
        // timeleft rounds down, so add a second to the way it's displayed
        value += 1;
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
#timer{position: absolute; width: 100%; height: 100%; z-index: 10; font-size: 18vw; text-align: center; vertical-align: middle; mix-blend-mode: multiply; font-family: "PT Mono", monospace; }
#timer span {position: fixed; left: 0; top: 50%; width: 100%; transform: translateY(-50%); font-color: #999;}
#footer {position: absolute; bottom: 10px; left: 10px; right: 10px; height: 4vh; font-size: 3vh; text-align: center; z-index: 20;}
.bar { height: 100%; float: left; background: #47C27C;     -webkit-transition: 1s ; -moz-transition: 1s ; -o-transition: 1s ; transition: 1s ;}
body.done { background: #47C27C; }
#help { margin: 40px 30px;}
</style>
