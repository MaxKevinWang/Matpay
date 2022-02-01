let plugins = []
if (process.env.CYPRESS_INTERNAL_ENV) {
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
