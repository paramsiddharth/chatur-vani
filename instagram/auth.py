import json
from pathlib import Path
from os import environ as env
from sys import stderr
from datetime import datetime, timedelta

from dotenv import load_dotenv

load_dotenv()

import requests

from constants import LOCAL_DIR, GRAPH_API_URL, GRAPH_API_VERSION, INSTAGRAM_GRAPH_API_URL
from errors import InvalidTokenError 

def get_user_id():
	return env.get('INSTAGRAM_USER_ID')

def get_app_secret():
	return env.get('FACEBOOK_APP_SECRET')

def get_access_token():
	right_now = datetime.utcnow()
	env_token = env.get('INSTAGRAM_USER_ACCESS_TOKEN')
	config_file = Path(LOCAL_DIR) / ".." / "config.json"

	if config_file.is_file():
		with open(config_file, 'r', encoding='utf-8') as f:
			config = json.load(f)
	else:
		# Retrieve token information
		req_url = f'{GRAPH_API_URL}/v{GRAPH_API_VERSION}/oauth/access_token_info'
		resp = requests.get(req_url, params={
			'access_token': env_token
		})
		if not resp.ok:
			print('Status code:', resp.status_code, file=stderr)
			raise InvalidTokenError('Invalid access token.')
		res = resp.json()
		token, expires_in = res['access_token'], res['expires_in']
		expiration = right_now + timedelta(seconds=expires_in)
		config = {
			'token':      token,
			'expires_on': expiration.isoformat()
		}
		with open(config_file, 'w', encoding='utf-8') as f:
			config = json.dump(f)
	
	token = config.get('token')
	expiration = datetime.fromisoformat(config.get('expiration'))
	if (expiration - datetime.utcnow()).days < 15:
		# Refresh token
		req_url = f'{INSTAGRAM_GRAPH_API_URL}/access_token'
		resp = requests.get(req_url, params={
			'access_token': env_token
		})
		if not resp.ok:
			print('Status code:', resp.status_code, file=stderr)
			raise InvalidTokenError('Invalid access token.')
		res = resp.json()
		token, expires_in = res['access_token'], res['expires_in']
		expiration = right_now + timedelta(seconds=expires_in)
		config = {
			'token':      token,
			'expires_on': expiration.isoformat()
		}
		with open(config_file, 'w', encoding='utf-8') as f:
			config = json.dump(f)

	return token