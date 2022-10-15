from sys import argv, stderr, exit

import twitter
import instagram

if __name__ == '__main__':
	args = argv[1:]

	if len(args) < 1:
		print('Please pass some text. :)', file=stderr)
		exit(1)
	
	text = args[0]
	twitter.tweet(text)
	print('Posted on Twitter! 🐥')
	instagram.post(text)
	print('Posted on Instagram! 📷')