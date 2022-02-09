let plugins = []
if (process.env.VUE_APP_CYPRESS) {
  plugins = [
    ['istanbul', {
      extension: ['.js', '.vue', '.ts']
    }]
  ]
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: plugins
}
