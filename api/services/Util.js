module.exports = {
  randRange: function(min, max) {
    return Math.round(Math.random() * (max - min) + min)
  }
}
