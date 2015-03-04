SiteView = require 'views/site-view'
HeaderView = require 'views/home/header-view'

module.exports = class Controller extends Chaplin.Controller
  # Reusabilities persist stuff between controllers.
  # You may also persist models etc.
  beforeAction:(params,route) ->
    @reuse 'site', SiteView
    HeaderView.path=route.action
    console.log(route.action)
    @reuse 'header', HeaderView, {region: 'header',active:route.action}
