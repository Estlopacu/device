require 'rubygems'
require 'sinatra/base'
require 'active_record'
require 'require_all'

module	Device
	class App < Sinatra::Application
	  get '/' do
	    'Hello world!'
	  end
	end
end

# require_relative 'conection'
# require_relative 'configuration'

# # Models
# require_all 'model/**'

# # Routes
# require_all 'controller/**'	

