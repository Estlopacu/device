# All routes related to Device
before do
	content_type 'application/json'
end

get '/' do
	Device.all.to_json
end
