from os import environ as env

from dotenv import load_dotenv

load_dotenv()

def get_user_id():
	return env.get('INSTAGRAM_USER_ID')

def get_access_token():
	return env.get('INSTAGRAM_USER_ACCESS_TOKEN')