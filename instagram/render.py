import subprocess
import json
from random import randint
from os import path, getcwd
from sys import stderr

from constants import LOCAL_DIR
from errors import RenderError

__all__ = [
	'render'
]

def render(text, colour = None, light = None, dir = None):
	if colour is None:
		colour, light = get_random_colour()

	if dir is None:
		dir = getcwd()
	
	light = 'yes' if light else 'no'

	try:
		if dir == ':-':
			proc = subprocess.run(
				['node', path.join(LOCAL_DIR, 'render-post'), text, colour, light, dir],
				stdout=subprocess.PIPE
			)
			return proc.stdout.decode('utf-8')
		else:
			subprocess.run(['node', path.join(LOCAL_DIR, 'render-post'), text, colour, light, dir])
	except Exception as e:
		print('Error:', e.args, file=stderr)
		raise RenderError('Failed to render.')

def get_random_colour():
	colours = load_colours()
	index = randint(0, len(colours) - 1)
	colour = colours[index]
	return colour['colour'], colour['light']

def load_colours():
	with open(path.join(LOCAL_DIR, 'colours.json'), 'r', encoding='utf-8') as f:
		return json.load(f)