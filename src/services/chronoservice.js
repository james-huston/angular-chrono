
function Timer(name, opts, listener) {
  this.timerId = null;
  this.name = name;
  this.opts = opts || { interval: 1000 };
  this.listener = listener;
  this.current = this.started = Date.now();
}

Timer.prototype.start = function timerStart() {
  var self = this;
  var drift = (Date.now() - this.started) % 1000;

  this.timerId = setTimeout(function() {
    self.listener(self.name, self);
    self.start();
  }, this.opts.interval - drift);

  return this;
};

Timer.prototype.stop = function timerStop() {
  clearTimeout(this.timerId);
  this.timerId = null;

  return this;
};

function ChronoService() {

  this.timers = {};
  this.listeners = {};

}

ChronoService.prototype.addTimer = function addTimer(name, opts) {
  this.timers[name] = new Timer(name, opts, this.onTick);
  return this;
};

ChronoService.prototype.removeTimer = function removeTimer(name) {
  if (!this.timers[name]) {
    return this;
  }

  this.timers[name].stop();
  delete this.timers[name];

  return this;
};

ChronoService.prototype.onTick = function onTick(name, timer) {
  timer.current = Date.now();
  angular.forEach(this.listeners[name], function(listener) {
    listener(null, timer);
  });
};

ChronoService.prototype.subscribe = function subscribe(name, fn) {
  if (typeof fn !== 'function') {
    fn = function noop() {};
  }

  if (!this.timers[name]) {
    fn(new Error('Timer ' + name + ' not found'));
    return this;
  }

  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(fn);

  return this;
};

ChronoService.prototype.unsubscribe = function unsubscribe(name, fn) {
  if (!this.listeners[name]) {
    return this;
  }

  var idx = -1;

  angular.forEach(this.listeners[name], function(listener, key) {
    if (listener === fn) {
      idx = key;
    }
  });

  if (idx !== -1) {
    this.listeners[name].splice(idx, 1);
  }

  return this;
};

ChronoService.prototype.start = function startService() {
  angular.forEach(this.timers, function(timer) {
    timer.start();
  });

  return this;
};

ChronoService.prototype.stop = function stopService() {
  angular.forEach(this.timers, function(timer) {
    timer.stop();
  });

  return this;
};

angular.module('angular-chrono')
       .service('chronoService', [ChronoService]);