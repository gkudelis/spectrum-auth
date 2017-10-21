import json
import requests
from datetime import datetime
from base64 import urlsafe_b64encode
import os
import calendar
from jose import jwt

def generate_jwt(application_id, keyfile) :
    application_private_key = open(keyfile, 'r').read()
    # Add the unix time at UCT + 0
    d = datetime.utcnow()

    token_payload = {
            "iat": calendar.timegm(d.utctimetuple()),  # issued at
            "application_id": application_id,  # application id
            "jti": urlsafe_b64encode(os.urandom(64)).decode('utf-8')
            }

    # generate our token signed with this private key...
    return jwt.encode(
            claims=token_payload,
            key=application_private_key,
            algorithm='RS256')

