from os import environ as env

from dotenv import load_dotenv

load_dotenv()

def get_consumer_key():
	return env.get('TWITTER_CONSUMER_KEY')

def get_consumer_secret():
	return env.get('TWITTER_CONSUMER_SECRET')

def get_access_token():
	return env.get('TWITTER_ACCESS_TOKEN')

def get_token_secret():
	return env.get('TWITTER_TOKEN_SECRET')