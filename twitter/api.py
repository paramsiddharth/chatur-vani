from sys import stderr

import tweepy

from errors import EmptyTweetError, UnauthorizedError, \
	TweetFailedError
from auth import get_consumer_key, get_consumer_secret, \
	get_access_token, get_token_secret

__all__ = [
	'tweet'
]

auth = tweepy.OAuth1UserHandler(
	get_consumer_key(),
	get_consumer_secret(),
	get_access_token(),
	get_token_secret()
)
twt = tweepy.API(auth, wait_on_rate_limit=True)

try:
	u = twt.get_user(screen_name='ParamSiddharth')
except Exception as e:
	print('Error:', e.args, file=stderr)
	raise UnauthorizedError('Invalid keys.')

print('🐤 Client initialized.')

def tweet(text='', **kwargs):
	if len(text) < 1:
		raise EmptyTweetError('The Tweet cannot be empty.')
	
	try:
		twt.update_status(text)
	except Exception as e:
		print('Error:', e.args, file=stderr)
		raise TweetFailedError('Faled to Tweet.')