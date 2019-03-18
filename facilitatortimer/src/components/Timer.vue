<template>
  <div>
    <vue-headful :title="timeLeft | timer" />
    <fullscreen ref="fullscreen" @change="fullscreenChange">
      <div v-for="line in bellPoints" class="bellline" v-bind:style="{ width: line/timerLength*100 + '%'}"> </div>
      <div id="prg">
        <div id="bar" v-bind:style="{ width: currentPercentage + '%' }" :class="{ final: isFinal}"></div>
        <div id="totalbar" v-bind:style="{ width: percentage + '%' }"></div>
      </div>
      <div id="timer" v-on:click="pressSpace">
        <span class="timeleft" v-resize-text="{ratio:1}" v-bind:class="{label: currentLabel}" >{{currentTimeLeft | timer(currentLabel)}}</span>
      </div>
      <a id="fullscreen" v-shortkey="['f']" @shortkey="toggleFS()" @click="toggleFS"><img src="/images/fullscreen.png" /></a>
      <div id="controls">
        <a v-shortkey.once="['h']" @shortkey="showHelp()" @click="showHelp"><img src="/images/help.png" /></a>
        <a v-shortkey.once="['s']" @shortkey="setTime()" @click="setTime"><img src="/images/alarm.png" /></a>
        <i v-shortkey.once="['space']" @shortkey="toggleTicker()"></i>
        <i v-shortkey.once="['1']" @shortkey="moreTime(60)"></i>
        <i v-shortkey.once="['2']" @shortkey="moreTime(120)"></i>
        <i v-shortkey.once="['3']" @shortkey="moreTime(180)"></i>
        <i v-shortkey.once="['4']" @shortkey="moreTime(240)"></i>
        <i v-shortkey.once="['5']" @shortkey="moreTime(300)"></i>
        <i v-shortkey.once="['6']" @shortkey="moreTime(360)"></i>
        <i v-shortkey.once="['7']" @shortkey="moreTime(420)"></i>
        <i v-shortkey.once="['8']" @shortkey="moreTime(480)"></i>
        <i v-shortkey.once="['9']" @shortkey="moreTime(520)"></i>
        <i v-shortkey.once="['0']" @shortkey="moreTime(600)"></i>
        <i v-shortkey.once="['r']" @shortkey="restart()"></i>
        <i v-shortkey.once="['s']" @shortkey="setTime()"></i>
        <i v-shortkey.once="['esc']" @shortkey="setTime()"></i>
        <i v-shortkey.once="['t']" @shortkey="moreTime(10)"></i>
      </div>
      <div id="footer">
        <strong>Press H</strong> for help. Made for facilitators by <a href="http://source.institute"><img src="/images/logo.png" class="logo"></a>
      </div>
      <modal name="set" height="auto" @before-close="" :pivotY="0.2" :adaptive="true">
        <form v-on:submit.prevent="setClosed">
          <input id="time" placeholder="Type seconds or HH:MM:SS" v-model="requestedTime" @focus="$event.target.select()" v-focus v-shortkey.avoid autocomplete="off" />
          <p>Then press <strong>enter</strong>. Reset any time by pressing <strong>Esc</strong>. <button v-on:click="showHelp">Advanced Options</button> </p>
        </form>
      </modal>
      <modal name="help" height="auto" width="80%" :adaptive="true" :scrollable="true">
        <div id="help">
          <h3>Help</h3>
          <p>This is a new project so <a href="mailto:salim@source.institute">feedback welcome!</a></p>
          <p>Set the time by pressing <strong>S</strong> or <strong>Esc</strong>.</p>
          <p>Press <strong>space</strong> to pause/unpause. <strong>R</strong> restarts the time. <strong>F</strong> toggles fullscreen.</p>
          <p>While the timer's running, <strong>1-9</strong> adds bonus time (in minutes). <strong>0</strong> adds 10 minutes. <strong>T</strong> adds 10 seconds.<br/>
          <p>Autostart by adding the timer to the address.  For example, <strong><a href="http://sourcetimer.com/3:00">sourcetimer.com/3:00</a></strong> for 3 minutes.</p>    
          <p>You can chain timers with <strong>/</strong> like <strong>10/2:30/30</strong> to run a 10 second, 2 and half minute, then 30 second timer. And you can add instructions with <strong>()</strong> like <strong>10(Get ready)/2:30(Work)/30(Clean up)</strong>. This is great for setting up links from your presentations.</p>
        </div>
      </modal>
    </fullscreen>
  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: {
  },
  components: {
  },
  data() {
    return {
      startTS: Date.now(),
      timerLength: 60,
      timeLeft: 60,
      timeElapsed: 0,
      currentTimeLeft: 60,
      currentLabel: "",
      timeElapsedSaved: 0,
      running: false,
      stopped: false,
      fullscreen: false,
      bellPoints: new Array(),
      internalTimers: new Array(),
      internalTimerLabels: new Array(),
      internalTimerMarker: 0,
      nextBell: new Array(),
      requestedTime: decodeURI(window.location.pathname.slice(1)),
      currentRequest: null,
      isFinal: false
    }
  },
  watch: {
    'requestedTime': function () {
      this.setupBellPoints();
      this.startTS = Date.now() - 1;
      this.updateTimeLeft({force: true}); 
      this.stopTicker(); //Stop ticker to save elapsed time
    },
    'internalTimerLabels': function () {
      this.updateCurrentLabel();
    },
    'internalTimerMarker': function () {
      this.updateCurrentLabel();
    }
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  computed: {
    endTS: function () {
      return this.startTS + this.timerLength * 1000;
    },
    currentTimerLength: function () {
      var ret = this.timerLength;
      if (typeof this.internalTimers[this.internalTimerMarker] !== 'undefined') {
        ret = this.internalTimers[this.internalTimerMarker];
      } 
      return ret;
    },
    percentage: function () {
      return (Number(this.timerLength-this.timeLeft)/ Number(this.timerLength)*100).toFixed(2);
    },
    currentPercentage: function () {
      return (Number(this.timerLength-this.timeLeft-this.prevTimers)/ this.currentTimerLength*100).toFixed(2);
    },
    prevTimers: function () {
      var prevTimers = 0;
      if (typeof this.bellPoints[this.internalTimerMarker-1] !== 'undefined') {
        prevTimers = this.bellPoints[this.internalTimerMarker-1];
      }
      return prevTimers;
    },
    upcomingBell: function () {
      var ret = this.timerLength;
      if (typeof this.nextBell[0] !== 'undefined') {
        ret = this.nextBell[0];
      }
      return  ret;
    }
  },
  methods: {
    setupTicker: function() {
      this.timer = setInterval(() => this.updateTimeLeft(), 500);
      this.running = true;
      this.$matomo.trackEvent('timer', 'start');
    },
    moreTime: function (number=60) {
      if (this.running) {
        this.timerLength+=(number);
        this.internalTimers[this.internalTimerMarker] += number;
        for (var i = 0; i < this.bellPoints.length; i++) {
          if (this.internalTimers[i] > this.timeElapsed) {
            this.bellPoints[i] += number;
          }
        }
        for (var i = 0; i < this.nextBell.length; i++) {
          this.nextBell[i] += number;
        }
        this.$matomo.trackEvent('timer', 'moretime');
      }
    },
    nextInternalTimer: function() {
      this.nextBell.shift();
      this.internalTimerMarker++;
    },
    updateCurrentLabel: function() {
      var ret = this.internalTimerLabels[this.internalTimerMarker];
      if (typeof ret === 'undefined') {
        this.currentLabel = "";
      } 
      this.currentLabel = ret;
    },
    updateTimeLeft: function(options = {}) {
      if (this.running || options['force'] == true) {
        this.timeLeft = ((this.endTS - Date.now())/1000);
        this.timeElapsed = this.timerLength-this.timeLeft;
        //var bellsRemaining = this.internalTimers.reduce((pv, cv) => pv+cv, 0); //sum remaining bells
        this.currentTimeLeft = this.currentTimerLength-this.timeElapsed+this.prevTimers;
    
        if (this.timeLeft < Math.min(this.timerLength/5, 60)) {
          this.isFinal = true;
        } else {
          this.isFinal = false;
        }

        if ((this.timerLength - this.timeLeft) > this.upcomingBell) {
            var bell = new Audio("/sounds/bell.mp3");
            bell.play();
            this.nextInternalTimer();
        }
        if (this.timeLeft < 0) {
            this.isFinal = false;
            var bell = new Audio("/sounds/bell.mp3");
            bell.play();
            this.running = false;
            this.stopped = true;
            this.setTime();
        } 
      }
    },
    setTime: function() {
      this.stopTicker();
      this.$modal.show('set');
      this.$matomo.trackEvent('timer', 'set');
    },
    setClosed: function() {
      this.restart();
      this.$modal.hide('set');
    },
    setupBellPoints: function () {
      var time = this.requestedTime;
      var totaltime = 0;

      //clear
      this.internalTimers = new Array ();
      this.internalTimerLabels = new Array ();
      this.bellPoints = new Array ();
      this.nextBell = new Array ();
      this.internalTimerMarker = 0;

      if (time) {
        var p = time.split('/');
        if (time.includes("/")) {
          for (var i = 0; i < p.length; i++) {
            this.internalTimerLabels[i] = this.convertClockToLabel(p[i]);
            this.internalTimers[i] = this.convertClockToSeconds(p[i]);
            totaltime += this.internalTimers[i];
            this.bellPoints[i] = totaltime ;
          }

          this.bellPoints.pop(); //last bell is the final
          this.nextBell = this.bellPoints.slice();
        } else {
          this.internalTimerLabels[0] = this.convertClockToLabel(time);
          totaltime = this.internalTimers[0] = this.convertClockToSeconds(time);
        }
          
        this.timerLength = totaltime;
        this.timeLeft = totaltime;
        this.startTicker();
      }
    },
    convertClockToLabel: function(clock) {
      if (!clock) return false; 

      if(clock = clock.match(/\(([^)]+)\)/)) {
        return clock[1];
      } else {
        return "";
      }

    },
    convertClockToSeconds: function(clock) {
      if (!clock) return false; 

      //Strip labels
      clock = clock.replace(/\(([^)]+)\)/gi, '');
      //Strip illegal chars
      clock = clock.replace(/[^[0-9:]/gi, '');

      var p, s, m;

      if (clock.includes(":")) {
        p = clock.split(':'), s = 0, m = 1;
        while (p.length > 0) {
          s += Number(m) * parseInt(Number(p.pop()), 10);
          m *= 60;
        }
      } else {
        s = Number(clock);
      }

      return s;
    },
    toggleFS () {
      this.$matomo.trackEvent('timer', 'fs');
      this.$fullscreen.toggle(document.body, {background: "#fff"});
    },
    stopTicker() {
      this.running = false;
      this.timeElapsedSaved = this.timerLength - this.timeLeft;
      this.$matomo.trackEvent('timer', 'pause');
    },
    startTicker () {
      this.running = true;
      this.startTS = Date.now() - this.timeElapsedSaved*1000 ;
      this.$matomo.trackEvent('timer', 'unpause');
    },
    pressSpace() {
      if (this.timeLeft == '0:00') {
        this.setTime();
      } else {
        this.toggleTicker();
      }
    },
    toggleTicker () {
      if (this.running) {
        this.stopTicker();
      } else {
        this.startTicker();
      }
    },
    fullscreenChange (fullscreen) {
      this.fullscreen = fullscreen
    },
    restart () {
      this.startTS = Date.now() ;
      this.setupBellPoints();
      this.running = true;
      this.$matomo.trackEvent('timer', 'restart');
    },
    showHelp () {
      this.$modal.toggle('help');
      this.$matomo.trackEvent('timer', 'help');
    }

  },
  filters: {
    timer: function(value, label) {
      if (label) {
        return label;
      } else if (!isNaN(value)) {
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
    this.setupTicker();
    this.setupBellPoints();
    this.updateCurrentLabel();
    this.updateTimeLeft();
  },
  mounted() {
    if(this.requestedTime == "") {
      this.$modal.show('set');
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style>
#fullscreen { position: fixed; right: 10px; bottom: 10px; z-index: 20}
#controls { position: fixed; right: 10px; top: 6%; z-index: 20}
#controls img { filter: greyscale(50%) hue-rotate(90deg); }
.bellline { position: absolute; top: 0; height: 4%; float: left; border-right: 0.5rem solid #999; z-index: 20;}
#prg { position: absolute; width: 100%; height: 100%; z-index: 0;}
#timer{position: absolute; width: 100%; height: 100%; z-index: 10; font-size: 18vw; text-align: center; vertical-align: middle; mix-blend-mode: multiply; font-family: "PT Mono", monospace; }
#timer span {position: fixed; left: 0; top: 50%; width: 100%; transform: translateY(-50%); font-color: #999;}
#timer span.label { font-family: "Oxygen"; }
#footer {position: absolute; bottom: 10px; left: 10px; right: 10px; height: 4vh; font-size: 3vh; text-align: center; z-index: 20; mix-blend-mode: multiply; }
#footer .logo {mix-blend-mode: overlay; }
#bar { height: 100%; float: left; background: #18c953;  -webkit-transition: 0.5s linear ; -moz-transition: 0.5s linear; -o-transition: 0.5s linear ; transition: 0.5s linear;  }
#totalbar { position: absolute; height: 4%; float: left; background: #000;  -webkit-transition: 0.5s linear ; -moz-transition: 0.5s linear; -o-transition: 0.5s linear ; transition: 0.5s linear;  }
#bar.final {    animation-duration: 500ms; animation-name: blink; animation-iteration-count: infinite; animation-direction: alternate;}
#help { margin: 40px 30px;}
.logo {height: 4vh;}
input { width: 94%; font-size: 2rem;}
form {margin: .5rem; text-align: center;}
#controls img, #fullscreen img { width: 1rem; min-width: 50px; min-height: 50px; height: 1rem; padding: 4px; }
@media all and (max-height: 250px) {
  #timer{font-size: 80vh; }
}
@media all and (max-height: 500px) {
  #fullscreen img, #controls img { width: 2rem; min-width: 30px; min-height: 30px; height: 2rem; padding: 4px; }
}
@keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
</style>

