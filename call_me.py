import json
import requests
from datetime import datetime
import calendar
from jose import jwt
import requests
from my_jwt import generate_jwt

#Set the endpoint
base_url = "https://api.nexmo.com"
version = "/v1"
action = "/calls"

#Application and call information
application_id = "a7ece3f9-48b2-4d2d-8a8b-c156c4561419"
keyfile = "private.key"
#Create your JWT
jwt = generate_jwt(application_id, keyfile)

#Create the headers using the jwt
headers = {
        "Content-type": "application/json",
        "Authorization": "Bearer {0}".format(jwt)
        }

#Change the to parameter to the number you want to call
payload = {
        "to":[{
            "type": "phone",
            "number": "447715957404"
            }],
        "from": {
            "type": "phone",
            "number": "447520635757"
            },
        "answer_url": ["https://54fa2cec.ngrok.io/ncco"]
        }

response = requests.post( base_url + version + action , data=json.dumps(payload), headers=headers)

if (response.status_code == 201):
    print(response.content)
else:
    print( "Error: " + str(response.status_code) + " " +    response.content)
